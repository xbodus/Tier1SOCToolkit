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

    def get_requests(self):
        sorted_logs = sorted(
            self.data,
            key=lambda x: datetime.fromisoformat(x["timestamp"])
        )

        start = datetime.fromisoformat(sorted_logs[0]["timestamp"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(sorted_logs[-1]["timestamp"].replace("Z", "+00:00"))

        time_range = end - start
        minutes = time_range.total_seconds() / 60

        results = Counter()
        for event in sorted_logs:
            ip = event["ip"]
            results[ip] += 1

        return results, minutes




# Open file and return log lines
def read_file(file) -> list[str]|None:
    lines = []
    for line in file:
        log_json = json.loads(line)

        timestamp = log_json.get("event", {}).get("created")
        ip = log_json.get("source", {}).get("ip")
        event = log_json.get("event", {}).get("original")
        status_code = log_json.get("http", {}).get("response", {}).get("status_code")

        log_data = {
            "timestamp": timestamp,
            "ip": ip,
            "event": event,
            "status_code": status_code
        }
        if log_data:
            lines.append(log_data)

    return lines



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

    results, minutes = analyzer.get_requests()

    print(f"Results: {results}, Time: {minutes} minutes")

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




