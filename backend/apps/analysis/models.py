from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class SampleImage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="uploads/%Y/%m/%d/")
    thumbnail = models.ImageField(upload_to="uploads/thumbs/%Y/%m/%d/", null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  # pragma: no cover - representation only
        return f"SampleImage {self.pk} by {self.user.email}"


class AnalysisResult(models.Model):
    sample = models.OneToOneField(SampleImage, on_delete=models.CASCADE)
    predicted_diseases = models.JSONField()
    medicines_recommended = models.JSONField()
    age_weeks = models.PositiveIntegerField(null=True, blank=True)
    flock_size = models.PositiveIntegerField(null=True, blank=True)
    processed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  # pragma: no cover - representation only
        return f"AnalysisResult for sample {self.sample_id}"
