from __future__ import annotations

from django.core.files.base import ContentFile
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analysis.models import AnalysisResult

from .models import Report
from .serializers import ReportSerializer
from .utils import generate_report_pdf


class ReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user).select_related("analysis", "analysis__sample")


class ReportGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        analysis_id = request.data.get("analysis_id")
        analysis = get_object_or_404(AnalysisResult, pk=analysis_id, sample__user=request.user)
        pdf_bytes = generate_report_pdf(
            {
                "id": analysis.id,
                "predicted_diseases": analysis.predicted_diseases,
                "medicines_recommended": analysis.medicines_recommended,
            }
        )
        filename = f"analysis_{analysis.id}_report.pdf"
        report = Report.objects.create(user=request.user, analysis=analysis)
        report.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)
        return Response({"report_id": report.id}, status=status.HTTP_201_CREATED)


class ReportDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int):
        report = get_object_or_404(Report, pk=pk, user=request.user)
        response = FileResponse(report.pdf_file.open("rb"), content_type="application/pdf")
        response["Content-Disposition"] = f"attachment; filename={report.pdf_file.name.split('/')[-1]}"
        return response
