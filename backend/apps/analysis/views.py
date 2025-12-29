from __future__ import annotations

import logging
import os
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from PIL import Image
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

import model_loader
from apps.diseases.models import Disease
from apps.medicines.models import Medicine

from .models import AnalysisResult, SampleImage
from .serializers import AnalysisResultSerializer, SampleImageSerializer

logger = logging.getLogger(__name__)

MAX_UPLOAD_SIZE = 8 * 1024 * 1024  # 8MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}


def _make_thumbnail(image_field) -> ContentFile:
    img = Image.open(image_field)
    img.thumbnail((512, 512))
    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    return ContentFile(buffer.getvalue(), name=f"thumb_{os.path.basename(image_field.name)}")


class AnalysisUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    throttle_scope = "analysis"

    def post(self, request, *args, **kwargs):
        uploaded = request.FILES.get("file")
        age_weeks_raw = request.data.get("age_weeks")
        flock_size_raw = request.data.get("flock_size")
        if not uploaded:
            return Response({"detail": "file is required"}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded.size > MAX_UPLOAD_SIZE:
            return Response({"detail": "File too large. Max 8MB."}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded.content_type not in ALLOWED_IMAGE_TYPES:
            return Response({"detail": "Invalid file type. Only JPEG/PNG allowed."}, status=status.HTTP_400_BAD_REQUEST)

        age_weeks = None
        flock_size = None
        if age_weeks_raw:
            try:
                age_weeks = int(age_weeks_raw)
                if age_weeks <= 0:
                    raise ValueError
            except ValueError:
                return Response({"detail": "age_weeks must be a positive integer"}, status=status.HTTP_400_BAD_REQUEST)
        if flock_size_raw:
            try:
                flock_size = int(flock_size_raw)
                if flock_size <= 0:
                    raise ValueError
            except ValueError:
                return Response({"detail": "flock_size must be a positive integer"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            sample = SampleImage.objects.create(user=request.user, image=uploaded)
            try:
                thumb_content = _make_thumbnail(sample.image)
                sample.thumbnail.save(thumb_content.name, thumb_content, save=True)
            except Exception as exc:  # pragma: no cover - best-effort thumbnail
                logger.warning("Thumbnail generation failed: %s", exc)
            # TODO: enqueue background job instead for heavy models
            sample.image.open("rb")
            prediction = model_loader.model_loader.predict(
                sample.image.read(), age_weeks=age_weeks, flock_size=flock_size
            )
            sample.image.close()
            diseases_payload = []
            for idx, pred in enumerate(prediction.get("predictions", [])):
                disease_obj = Disease.objects.filter(name__iexact=pred.get("disease")).first()
                diseases_payload.append(
                    {
                        "disease_id": disease_obj.id if disease_obj else idx,
                        "name": pred.get("disease"),
                        "confidence": pred.get("confidence", 0),
                    }
                )
            meds_payload = []
            for rec in prediction.get("recommendations", []):
                med_obj = Medicine.objects.filter(name__iexact=rec.get("medicine")).first()
                meds_payload.append(
                    {
                        "id": med_obj.id if med_obj else None,
                        "name": rec.get("medicine"),
                        "dosage": rec.get("dosage"),
                        "administration": rec.get("admin"),
                    }
                )

            result = AnalysisResult.objects.create(
                sample=sample,
                predicted_diseases=diseases_payload,
                medicines_recommended=meds_payload,
                age_weeks=age_weeks,
                flock_size=flock_size,
            )

        serializer = AnalysisResultSerializer(result)
        return Response({"analysis_id": result.id, "status": "completed", "result": serializer.data})


class AnalysisStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int, *args, **kwargs):
        try:
            result = AnalysisResult.objects.get(pk=pk, sample__user=request.user)
        except AnalysisResult.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"status": "completed", "progress": 100, "analysis_id": result.id})


class AnalysisResultView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AnalysisResultSerializer

    def get_queryset(self):
        return AnalysisResult.objects.filter(sample__user=self.request.user)


class HistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AnalysisResultSerializer
    pagination_class = None

    def get_queryset(self):
        return AnalysisResult.objects.filter(sample__user=self.request.user).select_related("sample").order_by("-processed_at")
