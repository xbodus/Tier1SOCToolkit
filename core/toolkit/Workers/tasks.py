import os
from dotenv import load_dotenv
import threading
from datetime import datetime, timezone

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from elasticsearch import Elasticsearch

from core.toolkit.log_monitor import log_monitor

load_dotenv()

# Initialize the client
es = Elasticsearch(
    ["https://localhost:9200"],
    verify_certs=True,
    ssl_assert_hostname=False,
    ssl_show_warn=False,
    ca_certs=os.getenv("CERT_PATH"),
    basic_auth=("elastic", os.getenv("ES_PASSWORD"))
)


channel_layer = get_channel_layer()

def start_es_worker(message, session_key):
    thread = threading.Thread(
        target=send_user_log,
        args=(message, session_key),
        daemon=True
    )
    thread.start()
    return thread


def send_user_log(message, session_key):
    stop_key = f"stop_logs_{session_key}"
    index = "nginx-logs-*"
    last_timestamp = datetime.now(timezone.utc).isoformat()


    while True:
        if cache.get(stop_key):
            print(f"[Worker] Stopping worker for {session_key}")
            break

        # Elasticsearch query
        query = {
            "size": 1000,
            "sort": [{"@timestamp": {"order": "asc"}}],
            "query": {
                    "range": {
                        "@timestamp": {"gt": last_timestamp}
                }
            },
            "_source": [
                "message",
                "client_ip",
                "method",
                "endpoint",
                "status_code",
                "bytes_sent",
                "referrer",
                "user_agent",
                "request_time",
                "@timestamp"
            ]
        }

        try:
            results = es.search(index=index, body=query)
        except Exception as e:
            print("ES error:", e)
            continue

        hits = results.get("hits", {}).get("hits", [])
        for hit in hits:
            source = hit["_source"]
            ts = source["@timestamp"]
            last_timestamp = ts  # update the pointer

            # analyze hit and monitor for potential malicious activity.
            alert = log_monitor(source, session_key)

            # send to websocket group
            async_to_sync(channel_layer.group_send)(
                f"user_logs_{session_key}",
                {
                    "type": "send_log",
                    "message": source,
                    "alert": alert
                }
            )

