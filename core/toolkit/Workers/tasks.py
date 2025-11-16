import asyncio
from channels.layers import get_channel_layer
from elasticsearch import Elasticsearch

# Path to your PEM file
cert_path = r"C:\Users\Titian-OmegaVI\PycharmProjects\SOCTeir1Toolkit-CapstoneProject\elk\certs\elastic-certificates.pem"

# Initialize the client
es = Elasticsearch(
    ["https://elasticsearch:9200"],
    verify_certs=True,
    ca_certs=cert_path,
    basic_auth=("elastic", "Gan5Q2++ncK-6FCTRjsx")
)

channel_layer = get_channel_layer()


async def send_user_log(message, session_key):
    print("Starting task")
    print("Session Key:", session_key)

    index = "filebeat-*"
    last_timestamp = None

    i = 20
    while i > 0:
        # Elasticsearch query
        query = {
            "size": 100,
            "sort": [{"@timestamp": {"order": "asc"}}],
            "query": {
                "match_all": {}} if last_timestamp is None else {
                    "range": {"@timestamp": {"gt": last_timestamp}
                }
            }
        }

        try:
            results = es.search(index=index, body=query)
        except Exception as e:
            print("ES error:", e)
            i = i-1
            await asyncio.sleep(1)
            continue

        hits = results.get("hits", {}).get("hits", [])


        for hit in hits:
            print(hit)
            source = hit["_source"]
            ts = source["@timestamp"]
            last_timestamp = ts  # update the pointer

            # send to websocket group
            await channel_layer.group_send(
                f"user_logs_{session_key}",
                {
                    "type": "send_log",
                    "message": source
                }
            )

        i = i-1
        await asyncio.sleep(1)

