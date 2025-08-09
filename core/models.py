from django.db import models
from datetime import date




class DailyRequests(models.Model):
    date = models.DateField(default=date.today, unique=True)
    count = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Daily Request"
        verbose_name_plural = "Daily Requests"



class ReportedMalicious(models.Model):
    ip_address = models.GenericIPAddressField(verbose_name="IP Address", unique=True)
    abuse_confidence_score = models.IntegerField()
    country_code = models.CharField(max_length=5, null=True, blank=True)
    isp = models.CharField(max_length=100, null=True, blank=True)
    last_reported_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.ip_address} (Malicious)"

    class Meta:
        verbose_name = "Reported Malicious IP"
        verbose_name_plural = "Reported Malicious IPs"



class Requests(models.Model):
    ip_address = models.GenericIPAddressField(verbose_name="IP Address")
    label = models.CharField(max_length=3, help_text="Signifies as source or destination ip", verbose_name="SRC/DST IP Address")
    ports = models.CharField(max_length=30, null=True, blank=True, help_text="SPT/DPT")
    timestamp = models.CharField(max_length=30, help_text="Log timestamp")
    reported_malicious = models.ForeignKey(ReportedMalicious, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests")

    def __str__(self):
        return f"{self.ip_address} @ {self.timestamp}"

    class Meta:
        verbose_name = "Request Log"
        verbose_name_plural = "Request Logs"

