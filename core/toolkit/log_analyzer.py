import re
import json

from collections import Counter
from datetime import datetime
from urllib.parse import unquote_plus








class LogAnalyzer:
    def __init__(self, data):
        self.data = data

    SQLI_PATTERNS = [
        r"\bunion\b\s+\bselect\b",  # More specific patterns first
        r"\bselect\b.{1,200}\bfrom\b",
        r"\binsert\s+into\b",
        r"\bupdate\b.{1,200}\bset\b",
        r"\bdelete\s+from\b",
        r"\bdrop\s+table\b",
        r"sle(?:e?)p\s*\(",
        r"benchmark\s*\(",
        r"waitfor\s+delay",
        r"\b(?:or|and)\b\s+1\s*=\s*\d",  # or 1=1 style
        r"\b(?:or|and)\b(?:\s|/\*.*?\*/)+.*?=.*?\d",
        r"/\*.*?\*/",  # SQL comments
        r"--",
        r"#",
        r"%27", r"%22",  # Encoded quotes
        r"'",  # Plain quotes last
        r"\"",
    ]

    SQLI_REGEX = re.compile("|".join(SQLI_PATTERNS), re.IGNORECASE)

    def analyze_requests(self):
        results = Counter()
        for event in self.data:
            ip = event.get("client_ip")
            results[ip] += 1

        most_requests = results.most_common(1)
        ip = most_requests[0][0]

        related_logs = [{"timestamp": event.get("@timestamp"), "message": event.get("message")} for event in self.data if event.get("client_ip") == ip]

        start = datetime.fromisoformat(related_logs[0].get("timestamp").replace("Z", "+00:00"))
        end = datetime.fromisoformat(related_logs[-1].get("timestamp").replace("Z", "+00:00"))

        time_range = end - start

        return {
            "ip": ip,
            "related_logs": related_logs,
            "time_elapsed": time_range,
        }

    def analyze_auth_attempts(self):
        ip_tracker = {}
        alerts = []

        for event in self.data:
            ip = event.get("client_ip")
            endpoint = event.get("endpoint")

            if endpoint != "/login":
                continue

            if event.get("status_code") == 401:
                ip_data = ip_tracker.get(ip, {"total": 0, "messages": []})

                ip_data["total"] += 1
                ip_data["messages"].append(event.get("message"))

                ip_tracker[ip] = ip_data
            elif event.get("status_code") == 302:
                total = ip_tracker.get(ip, {}).get("total")
                if total >= 5:
                    alerts.append(f"Brute-force succeeded from {ip}: {total} attempts")

        for ip in ip_tracker:
            total = ip_tracker.get(ip, {}).get("total")
            if total >= 5:
                alerts.append(f"Unsuccessful brute force attempt from {ip}: {total} attempts")

        return {
            "tracked_logs": ip_tracker,
            "alerts": alerts,
        }

    def analyze_sql_injection(self):
        sqli_attempts = []
        for event in self.data:
            endpoint = event.get("endpoint")
            if not isinstance(endpoint, str):
                continue

            decoded_endpoint = unquote_plus(endpoint)

            match = list(self.SQLI_REGEX.finditer(decoded_endpoint))
            if match:
                matches = [pattern.group(0) for pattern in match]
                most_relevant = max(matches, key=len)

                data = {
                    "ip": event.get("client_ip"),
                    "message": event.get("message"),
                    "matched": most_relevant
                }
                sqli_attempts.append(data)

        return sqli_attempts




# Open file and return log lines
def read_file(file) -> list[dict]|None:
    try:
        lines = [json.loads(line) for line in file]
        sorted_lines = sorted(
            lines,
            key=lambda x: datetime.fromisoformat(x.get("@timestamp"))
        )
        return sorted_lines
    except FileNotFoundError:
        print(f"File {file} not found")
        return None
    except json.decoder.JSONDecodeError:
        print(f"File {file} could not be decoded")
        return None





# Main parser
def analyze_log(file, alert_type):
    log_lines = read_file(file)

    analyzer = LogAnalyzer(log_lines)

    if alert_type == "dos":
        dos_data = analyzer.analyze_requests()
        return dos_data

    if alert_type == "brute-force":
        brute_force_attempts = analyzer.analyze_auth_attempts()
        return brute_force_attempts

    if alert_type == "sqli":
        sqli_attempts = analyzer.analyze_sql_injection()
        return sqli_attempts

    return None




