from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('api/port_scanner', views.port_scanner, name="port_scanner"),
    path('api/ip_reputation', views.ip_reputation, name="ip_reputation"),
    path('api/log_analyzer', views.log_analyzer, name="log_analyzer"),
]