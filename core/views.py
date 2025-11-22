import json
import time

from django.core.cache import cache
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from datetime import datetime
import ipaddress

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

from .toolkit.port_scanner import threaded_port_scan
from .toolkit.ip_reputation_checker import ip_check
from .toolkit.utils import is_valid_target
from .toolkit.log_analyzer import parse_log
from .toolkit.Workers.tasks import start_es_worker




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



def log_analyzer(request):
    if request.method == "POST":
        try:
            if "file" in request.FILES:
                file = request.FILES['file']
                print(file)
                start_time = datetime.now()
                data = parse_log(file)
                elapsed = start_time - datetime.now()

                context = {
                    "results" : data,
                    "total": len(data) if data else None,
                    "elapsed": elapsed,
                }

                return JsonResponse(context)
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
    # Generate a session key for the user if not already present
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