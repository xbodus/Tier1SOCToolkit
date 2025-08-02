import re, sqlite3
from concurrent.futures.thread import ThreadPoolExecutor

from .ip_reputation_checker import ip_check
from .utils import init_db







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


# Store log data to db
def store_in_db(log_lines):
    conn = sqlite3.connect("abuseIPDB_tracker.db")
    cursor = conn.cursor()
    try:
        rows_to_insert = []
        for line in log_lines:
            parsed_data = parse_data(line)
            ports_str = ""

            for port in parsed_data.get("ports", []):
                ports_str += f"{port.get('label', '')} {port.get('port', '')} "

            for ip in parsed_data.get("ips",[]):
                label = ip.get("label", "")
                ip = ip.get("ip", "")
                timestamp = parsed_data.get("timestamp", "Timestamp Error")

                rows_to_insert.append((ip, label, ports_str.strip(), timestamp))

        cursor.executemany(
            """
            INSERT INTO request_log (ip_address, label, ports, timestamp)
            VALUES (?, ?, ?, ?)
            """,
            rows_to_insert
        )
        conn.commit()

    except sqlite3.IntegrityError as e:
        print(f"Integrity error (duplicate key or constraint failed): {e}")
        conn.rollback()

    except sqlite3.OperationalError as e:
        print(f"Operational error (e.g., bad SQL, missing table): {e}")
        conn.rollback()

    except sqlite3.ProgrammingError as e:
        print(f"Programming error (e.g., bad API use): {e}")
        conn.rollback()

    except sqlite3.DatabaseError as e:
        print(f"General database error: {e}")
        conn.rollback()
    finally:
        conn.close()

    return



# Check if ip is already logged in malicious_ip table
def check_in_db(ip):
    conn = sqlite3.connect("abuseIPDB_tracker.db")
    cursor = conn.cursor()

    ip = "192.168.1.1"
    cursor.execute("""
                   SELECT EXISTS (SELECT 1
                                  FROM malicious_ips
                                  WHERE ip_address = ?);
                   """, (ip,))

    exists = cursor.fetchall()[0]
    if exists:
        return True

    return False



# Helper function for threaded ip check
def filter_malicious(line):
    ips = parse_for_ips(line)
    """
        What we need to do is check the db (malicious_ips table) prior to making a request to the abuseIPDB api.
        If the ip is in the malicious_ips table, then we'll return the data from the db, else we make the request to abuseIPDB and store that response to the malicious_ip table. 
    """
    malicious_lines = []
    for ip in ips:
        in_db = check_in_db(ip)
        if not in_db:
            check = ip_check(ip.get("ip", ""))
            if check.get("malicious", ""):
                malicious_lines.append({
                    "line": line,
                    "malicious_ip": ip
                })

    return malicious_lines



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
    init_db()
    log_lines = read_file(file)
    store_in_db(log_lines)

    malicious_results = threaded_ip_check(log_lines)

    # parsed_data = []
    # for malicious_line in malicious_results:
    #
    #     parsed_data.append({
    #         "malicious_ip": malicious_line.get("malicious_ip", ""),
    #         "timestamp": timestamp if timestamp else "Timestamp unavailable",
    #         "ips": ips if ips else "IPs unavailable",
    #         "protocol": protocol if protocol else "Protocols unavailable",
    #         "ports": ports if ports else "Ports unavailable"
    #     })
    #
    # return parsed_data




