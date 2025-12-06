import re
import json

from collections import Counter
from datetime import datetime
from urllib.parse import unquote_plus








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
            decoded_path = unquote_plus(url.lower())

            if not isinstance(url, str):
                continue

            if self.SQLI_REGEX.search(decoded_path):
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
        path = log_json.get("url", {}).get("original")

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





# Main parser
def analyze_log(file, alert_type):
    log_lines = read_file(file)


    analyzer = LogAnalyzer(log_lines)

    if alert_type == "dos-attack":
        results, minutes, seconds = analyzer.analyze_requests()
        print(f"Results: {results}, Time: {minutes} minutes {seconds} seconds")

    if alert_type == "brute-force":
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




