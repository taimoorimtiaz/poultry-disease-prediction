from __future__ import annotations

from rest_framework import serializers

from .models import Disease


class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = ["id", "name", "description", "symptoms", "images"]
