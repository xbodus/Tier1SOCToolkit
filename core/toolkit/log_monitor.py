from time import time

import redis

"""
object structure:
{'agent': {'name': 'Ubuntu-24', 'id': 'f4824e37-e4d2-42b2-aef2-c1fd691a6c0a', 'type': 'filebeat', 'ephemeral_id': 'f98c6699-622d-4548-99c6-28f9201e71ef', 'version': '9.1.3'}, 'log': {'file': {'path': '/var/log/apache2/access.log
'}, 'offset': 7736}, 'source': {'address': '192.168.56.1', 'ip': '192.168.56.1'}, 'fileset': {'name': 'access'}, 'url': {'path': '/static/styles.css', 'extension': 'css', 'original': '/static/styles.css'}, 'tags': ['_geoip_datab
ase_unavailable_GeoLite2-City.mmdb', '_geoip_database_unavailable_GeoLite2-ASN.mmdb'], 'input': {'type': 'log'}, '@timestamp': '2025-12-05T20:42:50.000Z', 'apache': {'access': {}}, 'ecs': {'version': '1.12.0'}, '_tmp': {}, 'serv
ice': {'type': 'apache'}, 'host': {'hostname': 'Ubuntu-24', 'os': {'kernel': '6.14.0-36-generic', 'codename': 'noble', 'name': 'Ubuntu', 'type': 'linux', 'family': 'debian', 'version': '24.04.3 LTS (Noble Numbat)', 'platform': '
ubuntu'}, 'containerized': False, 'ip': ['192.168.56.101', 'fe80::261d:8c0d:7fbc:db0'], 'name': 'ubuntu-24', 'id': '982d75a9856f4820a1290ff130bdc20a', 'mac': ['08-00-27-33-61-6D', '08-00-27-9A-01-BE'], 'architecture': 'x86_64'},
 'http': {'request': {'referrer': 'https://futurebank.local/', 'method': 'GET'}, 'response': {'status_code': 200, 'body': {'bytes': 792}}, 'version': '1.1'}, 'event': {'ingested': '2025-12-05T20:42:55.619533277Z', 'original': '1
92.168.56.1 - - [05/Dec/2025:15:42:50 -0500] "GET /static/styles.css HTTP/1.1" 200 792 "https://futurebank.local/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
Edg/142.0.0.0"', 'kind': 'event', 'created': '2025-12-05T20:42:52.067Z', 'module': 'apache', 'category': 'web', 'dataset': 'apache.access', 'outcome': 'success'}, 'user': {'name': '-'}, 'user_agent': {'original': 'Mozilla/5.0 (W
indows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'os': {'name': 'Windows', 'version': '10', 'full': 'Windows 10'}, 'name': 'Edge', 'device': {'name': 'Other'}, 'version': '142.0.0.0'}}
"""

r = redis.Redis(host='127.0.0.1', port=6379, db=0)

if r.ping():
    print("Redis is connected!")


r.flushdb()
print("Redis db has been flushed")

def log_monitor(log) -> bool|bool and str:
    ip = log.get("source", {}).get("ip")
    status_code = log.get("response", {}).get("status_code")
    path = log.get("url", {}).get("path")

    dos_alert = track_ip(ip)

    if dos_alert:
        return {"detected": True, "alert_type": "dos-attack"}

    return {"detected": False, "alert_type": None}


def track_ip(ip):
    now = int(time())
    r.hincrby(f"ip:{ip}", "count", 1)
    r.zadd(f"ip:{ip}:timestamps", {f"{now}": now})

    recent_count = r.zcount(f"ip:{ip}:timestamps", now - 60, now)

    if recent_count > 5:
        print(f"ALERT: {ip} exceeded threshold!")
        return True

    return False