import json

from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
import ipaddress
from .toolkit.port_scanner import threaded_port_scan
from .toolkit.ip_reputation_checker import ip_check
from .toolkit.utils import is_valid_target
from .toolkit.log_analyzer import parse_log
# Create your views here.


def home(request):
    return render(request, 'core/home.html')


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