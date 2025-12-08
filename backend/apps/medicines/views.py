from __future__ import annotations

from rest_framework import viewsets

from apps.users.permissions import IsAdminOrReadOnly

from .models import Medicine
from .serializers import MedicineSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["disease"]
    search_fields = ["name", "notes"]

    def get_queryset(self):
        qs = Medicine.objects.select_related("disease").all().order_by("name")
        disease_id = self.request.query_params.get("disease_id")
        if disease_id:
            qs = qs.filter(disease_id=disease_id)
        return qs
