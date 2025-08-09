from django.shortcuts import render
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
            target = request.POST.get("target", "")
            port_str = request.POST.get("port_range", "")
            start, end = (1, 1024)

            try:
                is_valid_target(target)
            except (ipaddress.AddressValueError, OSError) as e:
                error = e
                raise ValueError

            if port_str:
                try:
                    start_str, end_str = port_str.split("-", 1)
                    start = int(start_str)
                    end = int(end_str)
                except ValueError:
                    error = "Entered ports invalid."
                    raise ValueError

                print(start, end)
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

        return render(request, "core/port_scanner.html", context)

    return render(request, "core/port_scanner.html")



def ip_reputation(request):
    if request.method == "POST":
        ip = request.POST.get("ip", "")
        enrich = "enrich" in request.POST

        try:
            is_valid_target(ip)
        except (ipaddress.AddressValueError, OSError) as e:
            return render(request, "core/ip_reputation.html", {"error": str(e)})

        results = ip_check(ip, enrich)
        context = {
            "ip": ip,
            "results": results
        }

        return render(request, "core/ip_reputation.html", context)

    return render(request, "core/ip_reputation.html")



def log_analyzer(request):
    if request.method == "POST":
        if "file" in request.FILES:
            file = request.FILES['file']
            start_time = datetime.now()
            data = parse_log(file)
            elapsed = start_time - datetime.now()

            context = {
                "results" : data,
                "total": len(data) if data else None,
                "elapsed": elapsed,
            }

            return render(request, "core/log_analyzer.html", context)

    return render(request, "core/log_analyzer.html")