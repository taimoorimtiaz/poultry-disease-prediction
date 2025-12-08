from __future__ import annotations

from rest_framework import serializers

from .models import Medicine


class MedicineSerializer(serializers.ModelSerializer):
    disease_name = serializers.CharField(source="disease.name", read_only=True)

    class Meta:
        model = Medicine
        fields = ["id", "name", "disease", "disease_name", "dosage_guidelines", "administration", "notes"]
