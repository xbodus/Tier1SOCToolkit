import re
from .ip_reputation_checker import ip_check



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



# Main parser
def parse_log(file):
    log_lines = read_file(file)

    malicious_lines = []
    for line in log_lines:
        ips = parse_for_ips(line)

        for ip in ips:
            check = ip_check(ip.get("ip", ""))
            if check.get("malicious", ""):
                malicious_lines.append({
                    "line": line,
                    "malicious_ip": ip
                })

    parsed_data = []
    for malicious_line in malicious_lines:
        timestamp = parse_for_timestamp(malicious_line.get("line", ""))
        ips = parse_for_ips(malicious_line.get("line", ""))
        protocol = parse_for_proto(malicious_line.get("line", ""))
        ports = parse_for_port(malicious_line.get("line", ""))

        parsed_data.append({
            "malicious_ip": malicious_line.get("malicious_ip", ""),
            "timestamp": timestamp if timestamp else "Timestamp unavailable",
            "ips": ips if ips else "IPs unavailable",
            "protocol": protocol if protocol else "Protocols unavailable",
            "ports": ports if ports else "Ports unavailable"
        })

    return parsed_data

