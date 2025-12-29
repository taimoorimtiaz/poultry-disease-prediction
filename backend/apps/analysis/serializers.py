from __future__ import annotations

from rest_framework import serializers

from .models import AnalysisResult, SampleImage


class SampleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SampleImage
        fields = ["id", "image", "thumbnail", "uploaded_at"]
        read_only_fields = ["id", "thumbnail", "uploaded_at"]


class AnalysisResultSerializer(serializers.ModelSerializer):
    sample = SampleImageSerializer(read_only=True)

    class Meta:
        model = AnalysisResult
        fields = [
            "id",
            "sample",
            "predicted_diseases",
            "medicines_recommended",
            "age_weeks",
            "flock_size",
            "processed_at",
        ]
        read_only_fields = ["id", "processed_at"]
