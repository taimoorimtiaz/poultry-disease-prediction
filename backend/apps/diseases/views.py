from __future__ import annotations

from rest_framework import permissions, viewsets

from apps.users.permissions import IsAdminOrReadOnly

from .models import Disease
from .serializers import DiseaseSerializer


class DiseaseViewSet(viewsets.ModelViewSet):
    queryset = Disease.objects.all().order_by("name")
    serializer_class = DiseaseSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["name"]
    search_fields = ["name", "symptoms"]
