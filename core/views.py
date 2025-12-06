import json
import time
import os
from dotenv import load_dotenv

from django.core.cache import cache
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from datetime import datetime
import ipaddress

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

from elasticsearch import Elasticsearch

from .toolkit.port_scanner import threaded_port_scan
from .toolkit.ip_reputation_checker import ip_check
from .toolkit.utils import is_valid_target
from .toolkit.log_analyzer import analyze_log
from .toolkit.Workers.tasks import start_es_worker

load_dotenv()

es = Elasticsearch(
    ["https://elasticsearch:9200"],
    verify_certs=True,
    ca_certs=os.getenv("CERT_PATH"),
    basic_auth=("elastic", os.getenv("ES_PASSWORD"))
)

def home(request):
    return render(request, 'core/home.html')


def lab(request):
    return render(request, 'core/soc_lab.html')

def blog(request):
    return render(request, 'core/blog.html')


def port_scanner(request):
    error = None
    if request.method == "POST":
        try:
            body = json.loads(request.body)

            target = body.get("target")
            port_range = body.get("range")

            start = int(port_range.get("start", 1))
            end = int(port_range.get("end", 1024))

            try:
                is_valid_target(target)
            except (ipaddress.AddressValueError, OSError) as e:
                error = e
                raise ValueError

            if not 1<= start <= 65535 or not 1 <= end <= 65535:
                error = "Invalid entry. Ports must be between 1 and 65535."
                raise ValueError
            elif not start <= end:
                error = "Invalid entry. Start port must be less than end port."
                raise ValueError

            start_time = datetime.now()
            open_ports = threaded_port_scan(target, start, end)
            elapsed = datetime.now() - start_time
            context = {
                "results": open_ports,
                "status": elapsed
            }
        except ValueError:
            context = {
                "error": error
            }

        return JsonResponse({"data": context})

    return JsonResponse({"error": error})



def ip_reputation(request):
    if request.method == "POST":
        body = json.loads(request.body)
        ip = body.get("ip")
        enrich = body.get("enrichData")

        try:
            is_valid_target(ip)
        except (ipaddress.AddressValueError, OSError) as e:
            return JsonResponse({"error": str(e)})

        try:
            results = ip_check(ip, enrich)
        except Exception as e:
            return JsonResponse({"error": str(e)})

        context = {
            "ip": ip,
            "results": results
        }

        return JsonResponse(context)
    return None


# Request logs from session time range and send to React client for download
def download_logs(request):
    start = request.GET.get("start")
    end = request.GET.get("end")

    if not start or not end:
        return HttpResponseBadRequest("Missing start or end time")

    resp = es.search(
        index="filebeat-*",
        body={"query": {
                "range": {
                    "@timestamp": {
                        "gte": start,
                        "lte": end
                    }
                }
            }
        },
        scroll="2m",
        size=1000,
    )

    scroll_id = resp["_scroll_id"]
    hits = resp["hits"]["hits"]

    def generate():
        nonlocal scroll_id, hits

        while hits:
            # Output entries as NDJSON lines
            for hit in hits:
                yield json.dumps(hit["_source"]) + "\n"

            # Scroll to next page
            r = es.scroll(
                scroll_id=scroll_id,
                scroll="2m",
            )
            scroll_id = r["_scroll_id"]
            hits = r["hits"]["hits"]

    response = StreamingHttpResponse(
        generate(),
        content_type="application/x-ndjson"
    )
    response["Content-Disposition"] = 'attachment; filename="logs.ndjson"'

    return response



def log_analyzer(request):
    if request.method == "POST":
        try:
            if "file" in request.FILES:
                file = request.FILES['file']
                alert_type = request.GET.get("type")

                start_time = datetime.now()
                # Store triggered alert in session data. Pull here and pass into Log analyzer
                data = analyze_log(file, alert_type)
                elapsed = start_time - datetime.now()

                # context = {
                #     "results" : data,
                #     "total": len(data) if data else None,
                #     "elapsed": elapsed,
                # }
                #
                # return JsonResponse(context)
                return JsonResponse({"results" : "File came through"})
        except Exception as e:
            return JsonResponse({"error": str(e)})

    return None


@csrf_exempt
def log_ingestion(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST request required")

    try:
        data = json.loads(request.body.decode("UTF-8"))
    except Exception as e:
        return HttpResponseBadRequest(f"Invalid JSON: {e}")

    if not data:
        return HttpResponseBadRequest("No data provided")

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "logs",
        {
            "type": "log.message",
            "content": data
        }
    )
    return JsonResponse({"status": "ok"})


@require_GET
def request_logs(request):
    print("Starting request")
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key

    stop_key = f"stop_logs_{session_key}"
    cooldown_ends = cache.get(stop_key)


    # If cooldown exists and not expired
    if cooldown_ends:
        remaining = int(cooldown_ends - time.time())
        if remaining > 0:
            return JsonResponse({
                "cooldown": True,
                "cooldown_remaining": remaining,
                "session_key": session_key,
                "ws_url": None
            })

    # Call send_user_log form task.py. Pass message and session key
    start_es_worker("Starting log stream...", session_key)

    # Return the WebSocket info
    ws_url = f"ws://127.0.0.1:8000/ws/logs/{session_key}/"

    return JsonResponse({
        "ws_url": ws_url,
        "session_key": session_key
    })