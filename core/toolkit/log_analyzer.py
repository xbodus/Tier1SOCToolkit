import re
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import date

from django.forms import model_to_dict

from .ip_reputation_checker import ip_check
from core.models import DailyRequests, ReportedMalicious, Requests
from django.db import DatabaseError
from django.db.models import F







# Open file and return log lines
def read_file(file) -> list[str]|None:
    lines = []
    for line in file:
        decoded_line = line.decode("utf-8").strip()
        if decoded_line:
            lines.append(decoded_line)

    return lines


# Following section: Takes log lines and parses for timestamps, SRC/DST, protocol, SPT/DPT
def parse_for_timestamp(line:str) -> str | None:
    pattern = r'^[a-zA-Z]+\s\d{1,2}\s\d{2}(?::\d{2}){2}'
    match = re.search(pattern, line)

    if match:
        return match.group(0)

    return None


def parse_for_ips(line: str) -> list[dict]|None:
    pattern = r'(SRC|DST)=(\d{1,3}(?:\.\d{1,3}){3}|\b(?:[a-fA-F0-9:]+:+)+[a-fA-F0-9]+\b)'
    matches = re.findall(pattern, line)

    if matches:
        match_details = []
        for label, ip in matches:
            details = {
                "label": label,
                "ip": ip
            }
            match_details.append(details)

        return match_details

    return None


def parse_for_proto(line:str) -> str|None:
    pattern = r"PROTO=(\w+)"
    match = re.search(pattern, line)

    if match:
        return match.group(1)

    return None


def parse_for_port(line:str) -> list[dict]|None:
    pattern = r'(SPT|DPT)=(\d+)'
    matches = re.findall(pattern, line)

    match_details = []
    if matches:
        for label, port in matches:
            match_details.append({
                "label": label,
                "port": port
            })
        return match_details

    return None


# Main parse function
def parse_data(line):
    timestamp = parse_for_timestamp(line)
    ips = parse_for_ips(line)
    protocol = parse_for_proto(line)
    ports = parse_for_port(line)

    return {
        "timestamp": timestamp,
        "ips": ips,
        "protocol": protocol,
        "ports": ports
    }


def check_daily_count():
    request = DailyRequests.objects.filter(date=date.today()).first()
    if request:
        count = request.count
        return count
    return 0


def update_daily_requests():
    today = date.today()

    obj, created = DailyRequests.objects.get_or_create(date=today, defaults={'count': 0})

    if not created:
        # increment count by 1 atomically if exists
        DailyRequests.objects.filter(date=today).update(count=F('count') + 1)
    else:
        # newly created record, set count to 1
        obj.count = 1
        obj.save()

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
            "label": ip,
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

    malicious_results = threaded_ip_check(log_lines)

    formatted_data = []
    for result in malicious_results:
        line = result.get("line", "")

        for data in result.get("malicious_ips", []):
            ip = data.get("ip_address", "")
            in_data = ip in data.values()
            print(ip, formatted_data, in_data)
            if not formatted_data:
                print("Not in data")
                new_format = {
                    "ip": ip,
                    "data": {
                        "abuse_confidence_score": data.get("abuse_confidence_score", "ACS Error"),
                        "country_code": data.get("country_code", "CC Error"),
                        "isp": data.get("isp", "ISP Error"),
                        "last_reported_at": data.get("last_reported_at", "Last Reported Error")
                    },
                    "lines": [line],
                    "seen": 1
                }
                formatted_data.append(new_format)
            else:
                for new_data in formatted_data:
                    if ip in new_data.values():
                        new_data["lines"] = new_data["lines"].append(line)
                        new_data["seen"] += 1


    print(formatted_data)
    return malicious_results




