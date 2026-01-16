from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('lab', views.lab, name='lab'),
    path('articles', views.articles_list, name='articles'),
    path('articles/<str:slug>', views.article_detail, name='article_detail'),
    path('resources', views.resources, name='resources'),
    path('about', views.about, name='about'),
    path('api/articles/search', views.article_search_suggestions, name='search_articles'),
    path('api/ip_reputation', views.ip_reputation, name="ip_reputation"),
    path('api/log_analyzer', views.log_analyzer, name="log_analyzer"),
    path('api/logs/ingest', views.log_ingestion, name="log_ingest"),
    path('api/start-logs', views.request_logs, name="request_logs"),
    path("api/download-logs/", views.download_logs, name="download_logs"),
    path("api/start-simulation-1", views.dos_simulation, name="dos_simulation"),
    path("api/start-simulation-2", views.brute_force_simulation, name="brute_force_simulation"),
    path("api/start-simulation-3", views.sqli_simulation, name="sqli_simulation"),
]