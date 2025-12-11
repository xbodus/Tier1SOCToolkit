from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('lab', views.lab, name='lab'),
    path('api/port_scanner', views.port_scanner, name="port_scanner"),
    path('api/ip_reputation', views.ip_reputation, name="ip_reputation"),
    path('api/log_analyzer', views.log_analyzer, name="log_analyzer"),
    path('api/logs/ingest', views.log_ingestion, name="log_ingest"),
    path('api/start-logs', views.request_logs, name="request_logs"),
    path("api/download-logs/", views.download_logs, name="download_logs"),
    path("api/start-simulation-1", views.dos_simulation, name="dos_simulation")
]