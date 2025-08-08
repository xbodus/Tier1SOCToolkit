from django.contrib import admin
from .models import DailyRequests, Requests, ReportedMalicious

@admin.register(DailyRequests)
class DailyRequestsAdmin(admin.ModelAdmin):
    list_display = ("date", "count")
    ordering = ("-date",)

@admin.register(Requests)
class RequestsLogAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "label", "timestamp", "ports", "reported_malicious")
    search_fields = ("ip_address", "label")
    list_filter = ("label",)

@admin.register(ReportedMalicious)
class ReportedMaliciousAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "abuse_confidence_score", "country_code", "last_reported_at")
    search_fields = ("ip_address",)
    list_filter = ("abuse_confidence_score", "country_code")