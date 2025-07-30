import socket
from concurrent.futures import ThreadPoolExecutor





def scan_port(target: str, port: int) -> int|None:

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5) # Max time to connect to port
        try:
            result = s.connect_ex((target, port))
            if result == 0:
                return port

        except Exception:
            return None



def threaded_port_scan(target: str, start: int, end: int) -> list[int]:
    max_threads = 50
    open_ports = []

    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        futures = [executor.submit(scan_port, target, port) for port in range(start, end + 1)]
        for f in futures:
            result = f.result()
            if result:
                open_ports.append(result)

    return open_ports