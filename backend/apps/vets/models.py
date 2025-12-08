from __future__ import annotations

from django.db import models


class VetClinic(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    phone = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):  # pragma: no cover
        return self.name
