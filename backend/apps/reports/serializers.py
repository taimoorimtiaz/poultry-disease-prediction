from __future__ import annotations

from rest_framework import serializers

from apps.analysis.serializers import AnalysisResultSerializer

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    analysis = AnalysisResultSerializer(read_only=True)

    class Meta:
        model = Report
        fields = ["id", "analysis", "pdf_file", "created_at"]
        read_only_fields = ["id", "pdf_file", "created_at"]
