import json
import re
from time import time
from uuid import uuid4
from typing import Optional, Dict, Any, Tuple
from urllib.parse import unquote_plus, urlparse, parse_qs


import redis


# Session defaults
DEFAULT_SESSION = "global"

# TTLs (seconds) to avoid stale data
TTL_IP_HASH = 60 * 60  # 1 hour for ip:... hash metadata
TTL_IP_TIMESTAMPS = 5 * 60  # 5 minutes for zset of timestamps
TTL_BRUTEFORCE_KEY = 15 * 60  # 15 minutes for login attempts
TTL_SQLI_KEY = 10 * 60  # 10 minutes for any sqli counters (if used)
TTL_ALERT_QUEUE = 24 * 60 * 60  # keep alerts for 24h in Redis list by default

# Thresholds
DOS_LOG_WINDOW = 60  # seconds
DOS_LOG_THRESHOLD = 1000  # requests in DOS_LONG_WINDOW
DOS_BURST_WINDOW = 5  # seconds
DOS_BURST_THRESHOLD = 150  # requests in DOS_BURST_WINDOW

BRUTEFORCE_IP_THRESHOLD = 6  # triggers when attempts > this from same IP
BRUTEFORCE_USER_THRESHOLD = 10  # triggers when attempts > this for same username
BRUTEFORCE_USER_WINDOW = 15 * 60  # seconds to track username attempts

ALERT_SUPPRESSION = {
    "dos": 30,         # seconds to suppress subsequent DOS alerts for same IP/session
    "brute-force": 60,
    "sqli": 10,
}

# Severity weights (adjust to taste)
SEVERITY = {
    "dos": 5,
    "dos_burst": 6,
    "brute-force": 7,
    "brute-force-username": 9,
    "sqli": 8,
    "sqli-strong": 12,
}

# -------------------------
# SQLi detection utilities
# -------------------------
SQLI_PATTERNS = [
    r"\b(or|and)\b\s+1\s*=\s*\d",        # or 1=1 style
    r"\bunion\b\s+\bselect\b",
    r"\bselect\b.{1,200}\bfrom\b",
    r"\binsert\s+into\b",
    r"\bupdate\b.{1,200}\bset\b",
    r"\bdelete\s+from\b",
    r"\bdrop\s+table\b",
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


r = redis.Redis(host='127.0.0.1', port=6379, db=0)

if r.ping():
    print("Redis is connected!")



# Helper functions
def session_prefix(session_id: Optional[str]) -> str:
    """
        Return usable prefix for keys for redis queries; default to DEFAULT_SESSION (global)
        Output Example: session:<session_id or global>
    """
    return f"session:{session_id or DEFAULT_SESSION}"


def set_key(session_id: Optional[str], *parts: str) -> str:
    """
        Construct a Redis key under the given session.
        Output Example: <session_prefix>:<key type>:<scope>:...
    """
    return ":".join([session_prefix(session_id)] + list(parts))


def now_ts() -> int:
    """ Returns current time as a string for time range queries. """
    return int(time())


def suppress_alert(session_id: Optional[str], alert_type: str, scope: str, suppress_secs: int) -> bool:
    """
        Return True if we should suppress (i.e. recent alert exists).
        Scope should identify what the alert is about (e.g. ip:1.2.3.4 or user:alice).
    """
    k = set_key(session_id, "alert_suppress", alert_type, scope)
    last = r.get(k)
    current = now_ts()
    if last:
        # still within suppression
        return True
    # set suppression
    r.set(k, current, ex=suppress_secs)
    return False


def push_alert(session_id: Optional[str], alert: Dict[str, Any]) -> None:
    """
        Push alert JSON into a Redis list for later processing (Use in React for Log Analysis details).
        We also set a TTL on the list key so it doesn't live forever.
    """
    list_key = set_key(session_id, "alerts")
    r.lpush(list_key, json.dumps(alert))
    r.expire(list_key, TTL_ALERT_QUEUE)


def preprocess_for_sqli(raw_path: str) -> str:
    """
        Decode and normalize the incoming path/query to make SQLi detection more reliable.
        - URL-decode
        - remove C-style comments
        - replace encoded spaces and + with single spaces
        - collapse whitespace
    """
    decoded = unquote_plus(raw_path.lower())
    # remove c-style comments early to avoid obfuscation
    decoded = re.sub(r"/\*.*?\*/", "", decoded)
    decoded = decoded.replace("%20", " ")
    decoded = decoded.replace("+", " ")
    decoded = re.sub(r"\s+", " ", decoded)
    return decoded


def sqli_keyword_sequence(decoded: str, keywords: Tuple[str, ...]) -> bool:
    """
        Ensure keywords appear in order (not necessarily adjacent), handling trivial obfuscation.
        Example: ("union", "select")
    """
    last_index = -1
    for kw in keywords:
        idx = decoded.find(kw, last_index + 1)
        if idx == -1:
            return False
        last_index = idx
    return True





# -------------------------
# Detection functions
# -------------------------
def track_ip(session_id: Optional[str], ip: str, path: str) -> Tuple[bool, Dict[str, Any]]:
    """
    DoS detection:
      - Sliding long window (DOS_LONG_WINDOW) using ZSET of timestamps
      - Short burst detection (DOS_BURST_WINDOW) using same ZSET
    Returns tuple: (triggered: bool, details: dict)
    """
    now = now_ts()
    if not ip:
        return False, {}

    ts_zset = set_key(session_id, "ip", ip, "timestamps")

    # Add an event: member can be uuid, score is timestamp
    member = str(uuid4())
    r.zadd(ts_zset, {member: now})
    # Ensure TTL for maintenance
    r.expire(ts_zset, TTL_IP_TIMESTAMPS)

    # Clean up old entries beyond long window to keep zset compact
    r.zremrangebyscore(ts_zset, 0, now - DOS_LOG_WINDOW)

    long_count = r.zcount(ts_zset, now - DOS_LOG_WINDOW, now)
    if long_count > DOS_LOG_THRESHOLD:
        # suppression by IP
        scope = f"ip:{ip}"
        if not suppress_alert(session_id, "dos", scope, ALERT_SUPPRESSION["dos"]):
            details = {"ip": ip, "window": DOS_LOG_WINDOW, "count": long_count}
            alert = {
                "detected": True,
                "alert_type": "dos",
                "subtype": "long-window",
                "severity": SEVERITY.get("dos", 5),
                "evidence": details,
                "timestamp": now,
            }
            push_alert(session_id, alert)
            return True, alert
        return False, {}
    # check burst in shorter window
    r.zremrangebyscore(ts_zset, 0, now - DOS_BURST_WINDOW)
    burst_count = r.zcount(ts_zset, now - DOS_BURST_WINDOW, now)
    if burst_count > DOS_BURST_THRESHOLD:
        scope = f"ip:{ip}"
        if not suppress_alert(session_id, "dos_burst", scope, ALERT_SUPPRESSION["dos"]):
            details = {"ip": ip, "window": DOS_BURST_WINDOW, "count": burst_count}
            alert = {
                "detected": True,
                "alert_type": "dos",
                "subtype": "burst",
                "severity": SEVERITY.get("dos_burst", 6),
                "evidence": details,
                "timestamp": now,
            }
            push_alert(session_id, alert)
            return True, alert
    return False, {}



def track_brute_force(session_id: Optional[str], ip: str, status_code: Optional[int], path: str, raw_query: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Brute-force detection:
      - Track per-IP login attempts
      - Track per-username attempts (if username provided in query/form)
      - Return True and alert dict when thresholds exceeded
    """
    now = now_ts()
    # Only consider login endpoint
    if not path or not path.startswith("/login"):
        return False, {}

    # Parse username from query if present. If you have POST payloads, pass username explicitly to this function.
    username = None
    try:
        qs = parse_qs(raw_query or "")
        # typical parameter names: user, username, email
        for key in ("username", "user", "email"):
            v = qs.get(key)
            if v:
                username = v[0]
                break
    except Exception:
        username = None

    # Only count failed attempts (401) or redirect after failed auth depending on your app (302)
    if status_code not in (401, 302):
        return False, {}

    # Per-IP key
    ip_key = set_key(session_id, "bf", "ip", ip)
    ip_attempts = r.hincrby(ip_key, "count", 1)  # increment and get new value
    r.expire(ip_key, TTL_BRUTEFORCE_KEY)

    # Check per-username if we have one
    if username:
        user_key = set_key(session_id, "bf", "user", username)
        user_attempts = r.hincrby(user_key, "count", 1)
        r.expire(user_key, BRUTEFORCE_USER_WINDOW)
    else:
        user_attempts = 0

    # Evaluate thresholds
    # IP-based
    if ip_attempts >= BRUTEFORCE_IP_THRESHOLD:
        scope = f"ip:{ip}"
        if not suppress_alert(session_id, "brute-force", scope, ALERT_SUPPRESSION["brute-force"]):
            alert = {
                "detected": True,
                "alert_type": "brute-force",
                "subtype": "ip",
                "severity": SEVERITY.get("brute-force", 7),
                "evidence": {"ip": ip, "attempts": ip_attempts},
                "timestamp": now,
            }
            push_alert(session_id, alert)
            return True, alert

    # Username-based (more serious)
    if username and user_attempts >= BRUTEFORCE_USER_THRESHOLD:
        scope = f"user:{username}"
        if not suppress_alert(session_id, "brute-force", scope, ALERT_SUPPRESSION["brute-force"]):
            alert = {
                "detected": True,
                "alert_type": "brute-force",
                "subtype": "username",
                "severity": SEVERITY.get("brute-force-username", 9),
                "evidence": {"username": username, "attempts": user_attempts},
                "timestamp": now,
            }
            push_alert(session_id, alert)
            return True, alert

    return False, {}

def track_sqli(session_id: Optional[str], raw_path: str) -> Tuple[bool, Dict[str, Any]]:
    """
    SQLi detection:
      - Preprocess path (decode, strip comments, normalize)
      - Run combined regex and keyword-sequence checks
      - Return True + alert dict when suspicious
    """
    if not raw_path:
        return False, {}

    decoded = preprocess_for_sqli(raw_path)

    # Skip static assets quickly
    if decoded.startswith("/static/"):
        return False, {}

    # Quick sequence checks (strong indicators)
    # e.g. union + select, select + from, sleep + (
    if sqli_keyword_sequence(decoded, ("union", "select")) or sqli_keyword_sequence(decoded, ("select", "from")):
        # suppression
        scope = f"path:{decoded.split('?')[0]}"
        if not suppress_alert(session_id, "sqli", scope, ALERT_SUPPRESSION["sqli"]):
            alert = {
                "detected": True,
                "alert_type": "sqli",
                "subtype": "keyword-sequence",
                "severity": SEVERITY.get("sqli", 8),
                "evidence": {"path": decoded},
                "timestamp": now_ts(),
            }
            push_alert(session_id, alert)
            return True, alert

    # Regex fallback (catches more obfuscated forms)
    match = SQLI_REGEX.search(decoded)
    if match:
        # classify strength if multiple keywords present
        strength = "sqli"
        strong_hits = 0
        for kw in ("union", "select", "from", "benchmark", "sleep", "waitfor"):
            if kw in decoded:
                strong_hits += 1
        if strong_hits >= 2:
            strength = "sqli-strong"

        scope = f"path:{decoded.split('?')[0]}"
        if not suppress_alert(session_id, "sqli", scope, ALERT_SUPPRESSION["sqli"]):
            alert = {
                "detected": True,
                "alert_type": "sqli",
                "subtype": strength,
                "severity": SEVERITY.get(strength, SEVERITY.get("sqli", 8)),
                "evidence": {"match": match.group(0), "path": decoded},
                "timestamp": now_ts(),
            }
            push_alert(session_id, alert)
            return True, alert

    return False, {}



# -------------------------
# Main dispatcher
# -------------------------
def log_monitor(log: Dict[str, Any], session_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Main entrypoint for analyzing a single parsed log object.
    log is expected to be a dict (your parsed JSON log), with keys similar to:
      - source.ip
      - http.response.status_code
      - url.original (full path + query)
    session_id: optional id to namespace Redis keys (useful for simulations)
    Returns a dict describing detection status:
      {
        "detected": bool,
        "alert_type": Optional[str],
        "details": Optional[dict],
      }
    """
    # Extract fields safely
    ip = log.get("source", {}).get("ip")
    status_code = log.get("http", {}).get("response", {}).get("status_code")
    path_original = log.get("url", {}).get("original") or log.get("url", {}).get("path") or ""
    # If you stored raw query separately, pass it; otherwise split it here:
    parsed = urlparse(path_original)
    path_only = parsed.path or ""
    raw_query = parsed.query or ""

    # Run detectors in priority order
    # 1) DoS (long window / burst)
    dos_triggered, dos_alert = track_ip(session_id, ip, path_only)
    if dos_triggered:
        return {
            "detected": True,
            "alert_type": dos_alert.get("alert_type"),
            "details": dos_alert,
        }

    # 2) Brute force (login path)
    bf_triggered, bf_alert = track_brute_force(session_id, ip, status_code, path_only, raw_query)
    if bf_triggered:
        return {
            "detected": True,
            "alert_type": bf_alert.get("alert_type"),
            "details": bf_alert,
        }

    # 3) SQLi
    sqli_triggered, sqli_alert = track_sqli(session_id, path_original)
    if sqli_triggered:
        return {
            "detected": True,
            "alert_type": sqli_alert.get("alert_type"),
            "details": sqli_alert,
        }

    # Nothing suspicious
    return {"detected": False, "alert_type": None, "details": None}