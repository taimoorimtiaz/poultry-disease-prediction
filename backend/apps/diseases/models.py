from __future__ import annotations

from django.db import models


class Disease(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    symptoms = models.TextField()
    images = models.ManyToManyField("analysis.SampleImage", blank=True)

    def __str__(self):  # pragma: no cover
        return self.name
