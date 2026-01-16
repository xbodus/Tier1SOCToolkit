import json
import threading
import time
import os
from dotenv import load_dotenv

from django_ratelimit.decorators import ratelimit
from django.core.paginator import Paginator
from django.core.cache import cache
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from watson import search as watson_search

from datetime import datetime
import ipaddress

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

from elasticsearch import Elasticsearch

from .models import Article, Resource, ArticlesCategory
from .toolkit.Simulations.brute_force_sim import start_brute_force_simulation
from .toolkit.Simulations.dos_sim import start_dos_simulation
from .toolkit.Simulations.normal_traffic import start_normal_traffic
from .toolkit.Simulations.sqli_sim import start_sqli_simulation
from .toolkit.ip_reputation_checker import ip_check
from .toolkit.utils import is_valid_target
from .toolkit.log_analyzer import analyze_log
from .toolkit.Workers.tasks import start_es_worker

load_dotenv()

es = Elasticsearch(
    ["https://localhost:9200"],
    verify_certs=True,
    ssl_assert_hostname=False,
    ssl_show_warn=False,
    ca_certs=os.getenv("CERT_PATH"),
    basic_auth=("elastic", os.getenv("ES_PASSWORD"))
)

@ratelimit(key='ip', rate='20/m', method='GET')
def home(request):
    return render(request, 'core/home.html')

@ratelimit(key='ip', rate='20/m', method='GET')
def lab(request):
    return render(request, 'core/soc_lab.html')

@ratelimit(key='ip', rate='20/m', method='GET')
def articles_list(request):
    articles = Article.objects.filter(status='published')
    categories = ArticlesCategory.objects.all().order_by('id')
    difficulty = [d[1] for d in Article.DIFFICULTY_CHOICES]

    search_query = request.GET.get('q', '')
    category_slug = request.GET.get('category', '')
    difficulty_slug = request.GET.get('difficulty', '')
    read_time = request.GET.get('read_time', '')

    # Apply search
    if search_query:
        search_results = watson_search.search(search_query, models=(Article,))
        article_ids = [result.object.id for result in search_results]
        articles = articles.filter(id__in=article_ids)

    # Apply category filter
    if category_slug:
        articles = articles.filter(category__slug=category_slug)

    # Apply difficulty filter
    if difficulty_slug:
        articles = articles.filter(difficulty=difficulty_slug)

    # Apply read time filter
    if read_time:
        if read_time == 'short':
            articles = articles.filter(read_time__lte=5)
        elif read_time == 'medium':
            articles = articles.filter(read_time__gt=5, read_time__lte=15)
        elif read_time == 'long':
            articles = articles.filter(read_time__gt=15)

    p = Paginator(articles, 15)
    page_number = request.GET.get("page")
    page_obj = p.get_page(page_number)

    context = {
        'articles': page_obj,
        'categories': categories,
        'current_category': category_slug,
        'current_difficulty': difficulty,
        'current_read_time': read_time,
        'difficulty': difficulty,
    }

    return render(request, 'core/articles.html', context)

@ratelimit(key='ip', rate='20/m', method='GET')
def article_search_suggestions(request):
    query = request.GET.get('q', '').strip()

    if len(query) < 2:  # Don't search for single characters
        return JsonResponse({'results': []})

    # Search with Watson
    search_results = watson_search.search(
        query,
        models=(Article,),
        ranking=True
    )

    # Limit to top 5 results for autocomplete
    results = []
    for result in search_results[:5]:
        article = result.object
        if article.status == 'published':
            results.append({
                'title': article.title,
                'slug': article.slug,
                'excerpt': article.excerpt[:100] + '...' if len(article.excerpt) > 100 else article.excerpt,
                'url': article.get_absolute_url(),
                'category': article.category.name if article.category else None,
                'difficulty': article.get_difficulty_display() if article.difficulty else None,
                'read_time': article.read_time,
            })

    if not results:
        # Suggest popular articles or categories
        popular = Article.objects.filter(status='published').order_by('-published_date')[:3]
        results.append({
            'suggestions': [
                {
                    'title': a.title,
                    'url': a.get_absolute_url()
                } for a in popular
            ],
            'message': f"No results for '{query}'. Try these instead:"
        })

    return JsonResponse({'results': results})


@ratelimit(key='ip', rate='20/m', method='GET')
def article_detail(request, slug):
    article = Article.objects.get(slug=slug)
    suggestion_articles = Article.objects.filter(status='published').order_by('-published_date')[:5]

    suggestions = [a for a in suggestion_articles if a.title != article.title][:3]

    context = {
        'article': article,
        'suggestions': suggestions,
    }

    return render(request, 'core/article_detail.html', context )


@ratelimit(key='ip', rate='20/m', method='GET')
def resources(request):
    # resources = Resource.objects.filter(status='published')
    return render(request, 'core/resources.html')


@ratelimit(key='ip', rate='20/m', method='GET')
def about(request):
    return render(request, 'core/about.html')

"""
    LAB API Endpoints
"""
def get_session_key(request):
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key

    return session_key

def normal_worker(session_key):
    start_normal_traffic(session_key)

def dos_worker(session_key, start_key):
    time.sleep(60)
    start_dos_simulation(session_key, start_key)

@ratelimit(key='ip', rate='20/m', method='GET')
def dos_simulation(request):
    session_key = get_session_key(request)

    stop_key = f"stop_logs_{session_key}"
    start_key = f"dos_sim_started_{session_key}"

    brute_force_key = f"brute_force_sim_started_{session_key}"
    sqli_key = f"sqli_sim_started_{session_key}"

    cache.set(start_key, True)
    cache.delete(brute_force_key)
    cache.delete(sqli_key)

    while cache.get(stop_key):
        print("Waiting to start traffic")
        time.sleep(1)

    if not cache.get(brute_force_key) or not cache.get(sqli_key):
        threading.Thread(
            target=dos_worker,
            args=(session_key, start_key,),
            daemon=True
        ).start()

        return JsonResponse({"status": "ok", "message": "Dos Simulation started"})

    return JsonResponse({"status": "error", "message": "Another simulation in progress"})



def brute_force_worker(session_key, start_key):
    time.sleep(60)
    start_brute_force_simulation(session_key, start_key)

@ratelimit(key='ip', rate='20/m', method='GET')
def brute_force_simulation(request):
    session_key = get_session_key(request)

    stop_key = f"stop_logs_{session_key}"
    start_key = f"brute_force_sim_started_{session_key}"

    cache.set(start_key, True)

    sqli_key = f"sqli_sim_started_{session_key}"
    dos_key = f"dos_sim_started_{session_key}"

    cache.delete(sqli_key)
    cache.delete(dos_key)

    while cache.get(stop_key):
        print("Waiting to start traffic")
        time.sleep(1)

    if not cache.get(sqli_key) or not cache.get(dos_key):
        threading.Thread(
            target=brute_force_worker,
            args=(session_key, start_key,),
            daemon=True
        ).start()

        return JsonResponse({"status": "ok", "message": "Brute Force Simulation started"})

    return JsonResponse({"status": "error", "message": "Another simulation in progress"})



def sqli_worker(session_key, start_key):
    time.sleep(60)
    start_sqli_simulation(session_key, start_key)

@ratelimit(key='ip', rate='20/m', method='GET')
def sqli_simulation(request):
    session_key = get_session_key(request)

    stop_key = f"stop_logs_{session_key}"
    start_key = f"sqli_sim_started_{session_key}"

    cache.set(start_key, True)

    dos_key = f"dos_sim_started_{session_key}"
    brute_force_key = f"brute_force_sim_started_{session_key}"

    cache.delete(dos_key)
    cache.delete(brute_force_key)

    while cache.get(stop_key):
        print("Waiting to start traffic")
        time.sleep(1)

    if not cache.get(brute_force_key) or not cache.get(dos_key):
        threading.Thread(
            target=sqli_worker,
            args=(session_key, start_key,),
            daemon=True
        ).start()

        return JsonResponse({"status": "ok", "message": "SQLi Simulation started"})

    return JsonResponse({"status": "error", "message": "Another simulation in progress"})


def check_rate_limit(request):
    ip = request.META.get('REMOTE_ADDR')
    cache_key = f'upload_limit_{ip}'

    request_count = cache.get(cache_key, 0)
    if request_count >= 5:
        return True

    cache.set(cache_key, request_count + 1, 60)
    return False


def ip_reputation(request):
    rate_limit = check_rate_limit(request)
    if rate_limit:
        return JsonResponse({"error": "Too many requests. Please wait."}, status=429)

    if request.method == "POST":
        try:
            if "ip" in request.POST and "enrich" in request.POST:
                ip = request.POST.get("ip")
                enrich = True if request.POST.get("enrich") == "true" else False

                try:
                    is_valid_target(ip)
                except (ipaddress.AddressValueError, OSError) as e:
                    return JsonResponse({"error": "Invalid IPv4 address"})

                try:
                    results = ip_check(ip, enrich)
                except Exception as e:
                    return JsonResponse({"error": str(e)})

                context = {
                    "ip": ip,
                    "results": results
                }

                return JsonResponse(context)
        except Exception as e:
            return JsonResponse({"error": str(e)})

    return None


# Request logs from session time range and send to React client for download
@ratelimit(key='ip', rate='20/m', method='GET')
def download_logs(request):
    start = request.GET.get("start")
    end = request.GET.get("end")

    if not start or not end:
        return HttpResponseBadRequest("Missing start or end time")

    resp = es.search(
        index="nginx-logs-*",
        body={"query": {
                "range": {
                    "@timestamp": {
                        "gte": start,
                        "lte": end
                        }
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
    rate_limit = check_rate_limit(request)
    if rate_limit:
        return JsonResponse({"error": "Too many requests. Please wait."}, status=429)

    if request.method == "POST":
        try:
            if "file" in request.FILES:
                file = request.FILES['file']
                alert_type = request.GET.get("type")

                start_time = datetime.now()
                # Store triggered alert in session data. Pull here and pass into Log analyzer
                data = analyze_log(file, alert_type)
                elapsed = start_time - datetime.now()

                if data:
                    context = {
                        "results" : data,
                        "total": len(data),
                        "elapsed": elapsed,
                    }
                    return JsonResponse(context, status=200)
                else:
                    context = {
                        "results": "No confirmed suspicious data",
                        "total": 0,
                        "elapsed": elapsed,
                    }
                    return JsonResponse(context, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

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


@ratelimit(key='ip', rate='20/m', method='GET')
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

    threading.Thread(
        target=normal_worker,
        args=(session_key,),
        daemon=True
    ).start()

    return JsonResponse({
        "ws_url": ws_url,
        "session_key": session_key
    })