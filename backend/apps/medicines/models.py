from __future__ import annotations

from django.db import models

from apps.diseases.models import Disease


class Medicine(models.Model):
    name = models.CharField(max_length=200)
    disease = models.ForeignKey(Disease, on_delete=models.CASCADE, related_name="medicines")
    dosage_guidelines = models.TextField()
    administration = models.TextField()
    notes = models.TextField(blank=True, null=True)

    def __str__(self):  # pragma: no cover
        return self.name
