from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('port_scanner', views.port_scanner, name="port_scanner"),
    path('ip_reputation', views.ip_reputation, name="ip_reputation"),
    path('log_analyzer', views.log_analyzer, name="log_analyzer"),
]