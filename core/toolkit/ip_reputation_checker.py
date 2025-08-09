import requests

from SOCTeir1Toolkit_CapstoneProject.settings import env

"""
    1. Check against AbuseIPDB
    2. Enrich IP in ipinfo.io
    
    No need to validate the ip, should already be checked with is_valid_target prior to calling for the malicious check
"""


def enrich_data(ip: str) -> dict:
    token = env("IPINFO_API_KEY")
    url = f"https://api.ipinfo.io/lite/{ip}?token={token}"
    headers = {
        "Accept": "application/json"
    }

    request = requests.get(url, headers=headers)
    data = request.json()

    enriched_data = {
        "country": data.get("country", "Unknown"),
        "continent_code": data.get("continent_code", "Unknown"),
        "asn": data.get("asn", "Unknown"),
        "org": data.get("as_name", "Unknown"),
        "as_domain": data.get("as_domain", "Unknown")
    }

    return enriched_data


def ip_check(ip: str, enrich = False) -> dict:
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Accept": "application/json",
        "key": env("ABUSEIPDB_API_KEY")
    }
    params = {
        "ipAddress": ip
    }

    request = requests.get(url, params=params, headers=headers)
    data = request.json()

    ip_data = {
            "malicious": True if data.get("data", {}).get("abuseConfidenceScore", 0) >= 30 else False,
            "data": data
        }


    if enrich:
        data = enrich_data(ip)
        ip_data.update({"enriched_data": data})

    return ip_data