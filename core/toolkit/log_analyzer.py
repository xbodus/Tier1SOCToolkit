import re
import time
import json
from collections import Counter
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import date, datetime

from django.forms import model_to_dict

from .ip_reputation_checker import ip_check
from core.models import DailyRequests, ReportedMalicious, Requests
from django.db import transaction, OperationalError, DatabaseError
from django.db.models import F






class LogAnalyzer:
    def __init__(self, data):
        self.data = data

    SQLI_PATTERNS = [
        r"(\bor\b|\band\b)\s+1\s*=\s*1",
        r"union\s+select",
        r"select\s+.+\s+from",
        r"insert\s+into",
        r"update\s+.+\s+set",
        r"delete\s+from",
        r"drop\s+table",
        r"sle(e?)p\s*\(",
        r"benchmark\s*\(",
        r"waitfor\s+delay",
        r"--",
        r"#",
        r"/\*.*?\*/",
        r"%27", r"%22",
        r"'",
        r"\"",
    ]

    SQLI_REGEX = re.compile("|".join(SQLI_PATTERNS), re.IGNORECASE)

    def analyze_requests(self):
        sorted_logs = sorted(
            self.data,
            key=lambda x: datetime.fromisoformat(x["timestamp"])
        )

        start = datetime.fromisoformat(sorted_logs[0]["timestamp"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(sorted_logs[-1]["timestamp"].replace("Z", "+00:00"))

        time_range = end - start
        minutes = int(time_range.total_seconds() / 60)
        seconds = int(time_range.total_seconds())

        results = Counter()
        for event in sorted_logs:
            ip = event["ip"]
            results[ip] += 1

        return results, minutes, seconds


    def analyze_auth_attempts(self):
        streaks = {}
        alerts = []
        unsuccessful = []
        for event in self.data:
            ip = event["ip"]
            path = event["path"]

            if path != "/login":
                continue
            print(event["status_code"])
            if event["status_code"] == 401:
                streaks[ip] = streaks.get(ip, 0) + 1
            elif event["status_code"] == 302:
                if streaks.get(ip, 0) >= 5:
                    alerts.append(f"Brute-force succeeded from IP: {ip}")
                streaks[ip] = 0

        for address, count in streaks.items():
            if count >= 5:
                unsuccessful.append(f"Unsuccessful brute force attempt from {address}: {count} attempts")

        if len(alerts) > 0 and len(unsuccessful) > 0:
            return alerts, unsuccessful

        if len(alerts) > 0:
            return alerts

        if len(unsuccessful) > 0:
            return unsuccessful

        return "No brute force attacks suspected"


    def analyze_sql_injection(self):
        suspicious = []

        for event in self.data:
            url = event.get("path")

            if not isinstance(url, str):
                continue

            if self.SQLI_REGEX.search(url):
                suspicious.append(event["ip"])

        return Counter(suspicious)




# Open file and return log lines
def read_file(file) -> list[str]|None:
    lines = []
    for line in file:
        log_json = json.loads(line)

        timestamp = log_json.get("event", {}).get("created")
        ip = log_json.get("source", {}).get("ip")
        event = log_json.get("event", {}).get("original")
        status_code = log_json.get("http", {}).get("response", {}).get("status_code")
        outcome = log_json.get("event", {}).get("outcome")
        path = log_json.get("url", {}).get("path", {})

        log_data = {
            "timestamp": timestamp,
            "ip": ip,
            "event": event,
            "status_code": status_code,
            "outcome": outcome,
            "path": path
        }
        if log_data:
            lines.append(log_data)

    sorted_lines = sorted(
        lines,
        key=lambda x: datetime.fromisoformat(x["timestamp"])
    )

    return sorted_lines



def check_daily_count():
    request = DailyRequests.objects.filter(date=date.today()).first()
    if request:
        count = request.count
        return count
    return 0


def update_daily_requests():
    today = date.today()
    retries = 5
    while retries:
        try:
            with transaction.atomic():
                obj, created = DailyRequests.objects.get_or_create(
                    date=today,
                    defaults={'count': 1}
                )
                if not created:
                    DailyRequests.objects.filter(pk=obj.pk).update(count=F('count') + 1)
            break
        except OperationalError as e:
            if "database is locked" in str(e):
                time.sleep(0.5)  # wait and retry
                retries -= 1
            else:
                raise
    return


# Store AbuseIPDB request in database
def store_request(parsed_data, malicious_obj=None):
    try:
        ports_str = " ".join(
            f"{port.get('label', '')}: {port.get('port', '')}"
            for port in parsed_data.get("ports", [])
        ).strip()
    except TypeError:
        ports_str = None

    try:
        Requests.objects.create(
            ip_address=parsed_data.get("ip", "IP Error"),
            label=parsed_data.get("label", "Label Error"),
            ports=ports_str,
            timestamp=parsed_data.get("timestamp", "Timestamp Error"),
            reported_malicious=malicious_obj
        )
    except DatabaseError as e:
        print(f"Database Error: {e}")

    return


# Check if IP is already in ReportedMalicious table
def reported_malicious(ip):
    in_db = ReportedMalicious.objects.filter(ip_address=ip).exists()
    return in_db


# ip_address, abuse_confidence_score, country_code, isp, last_reported_at
def store_malicious(abuse_data):
    try:
        ReportedMalicious.objects.create(
            ip_address= abuse_data.get("data", {}).get("ipAddress", "IP Address Error"),
            abuse_confidence_score= abuse_data.get("data", {}).get("abuseConfidenceScore", "ACS Error"),
            country_code= abuse_data.get("data", {}).get("countryCode", "CC Error"),
            isp= abuse_data.get("data", {}).get("isp", "ISP Error"),
            last_reported_at= abuse_data.get("data", {}).get("lastReportedAt", "Last Reported Error")
        )
    except DatabaseError as e:
        print(f"Database Error: {e}")
    return


# Helper function for threaded ip check
def filter_malicious(line):
    """
        Check the ip and store the request
        !If ip is already stored in ReportedMalicious, pull data from the db and don't make a new request
    """
    parsed_data = parse_data(line)

    malicious_ips = []
    for ip in parsed_data.get("ips", []):
        label, ip = ip["label"], ip["ip"]
        in_database = reported_malicious(ip)

        if not in_database:
            daily_count = check_daily_count()
            if daily_count >= 1000:
                return f"AbuseIPDB request limit reached for the day {date.today()} resets at 12AM EST"

            check_malicious = ip_check(ip)
            is_malicious = check_malicious.get("malicious", False)
            update_daily_requests()
            if is_malicious:
                store_malicious(check_malicious.get("data", {}))

        try:
            malicious_obj = ReportedMalicious.objects.get(ip_address=ip)
            # If in db append, db data
            malicious_ips.append(model_to_dict(malicious_obj))
        except ReportedMalicious.DoesNotExist:
            malicious_obj = None

        store = {
            "ip": ip,
            "label": label,
            "timestamp": parsed_data.get("timestamp", "Timestamp Error"),
            "ports": parsed_data.get("ports", []),
        }

        store_request(store, malicious_obj)

    if malicious_ips:
        return {
            "line": line,
            "malicious_ips": malicious_ips
        }

    return {}




# Speed up ip checks for larger files
def threaded_ip_check(log_lines):
    malicious_results = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(filter_malicious, line) for line in log_lines]

        for f in futures:
            result = f.result()
            if result:
                malicious_results.append(result)
                """
                    What we need to do is check the result. At this point if the ip comes back as malicious we should store all the parsed data from the line to the malicious results to be returned.
                """

    return malicious_results



# Main parser
def parse_log(file):
    log_lines = read_file(file)


    analyzer = LogAnalyzer(log_lines)

    results, minutes, seconds = analyzer.analyze_requests()

    print(f"Results: {results}, Time: {minutes} minutes {seconds} seconds")

    brute_force_attempts = analyzer.analyze_auth_attempts()
    print(brute_force_attempts)

    return None
    # malicious_results = threaded_ip_check(log_lines)
    #
    # agg = {}
    # for result in malicious_results:
    #     line = result["line"]
    #     for data in result["malicious_ips"]:
    #         ip = data["ip_address"]
    #         if ip not in agg:
    #             agg[ip] = {
    #                 "ip": ip,
    #                 "data": {
    #                     "abuse_confidence_score": data.get("abuse_confidence_score", "ACS Error"),
    #                     "country_code": data.get("country_code", "CC Error"),
    #                     "isp": data.get("isp", "ISP Error"),
    #                     "last_reported_at": data.get("last_reported_at", "Last Reported Error")
    #                 },
    #                 "lines": [],
    #                 "seen": 0
    #             }
    #         agg[ip]["lines"].append(line)
    #         agg[ip]["seen"] += 1
    #
    # formatted_data = list(agg.values())

    # return formatted_data




