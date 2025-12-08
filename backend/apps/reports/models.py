from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.analysis.models import AnalysisResult


class Report(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    analysis = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE)
    pdf_file = models.FileField(upload_to="reports/%Y/%m/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  # pragma: no cover
        return f"Report {self.id} for analysis {self.analysis_id}"
