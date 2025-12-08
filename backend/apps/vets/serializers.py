from __future__ import annotations

from rest_framework import serializers

from .models import VetClinic


class VetClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = VetClinic
        fields = ["id", "name", "address", "lat", "lng", "phone"]
