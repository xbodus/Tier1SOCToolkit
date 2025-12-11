import requests
from urllib3 import disable_warnings
from urllib3.exceptions import InsecureRequestWarning
from bs4 import BeautifulSoup


disable_warnings(InsecureRequestWarning)

LOGIN_URL = "https://futurebank.local/login"
DASHBOARD_URL = "https://futurebank.local/dashboard"

fake_ip = "123.45.67.89"

session = requests.Session()

# Disable cert verification ONLY for testing environments
session.verify = False

# 1. GET login page to receive CSRF + cookies
resp = session.get(LOGIN_URL)
soup = BeautifulSoup(resp.text, "html.parser")

csrf = soup.find("input", id="csrf_token")["value"]

# 2. Now POST login data with CSRF + cookies
payload = {
    "username": "test",
    "password": "test",
    "csrf_token": csrf,
}

headers = {
    "X-Spoof": "1",
    "X-Spoof-IP": fake_ip,
    "User-Agent": "Mozilla/5.0",
    "Referer": LOGIN_URL,
}

resp2 = session.post(LOGIN_URL, data=payload, headers=headers, allow_redirects=True, verify=False)

print("Status:", resp2.status_code)
print("Headers:", resp2.headers)


