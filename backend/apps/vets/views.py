from __future__ import annotations

import math

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.users.permissions import IsAdminOrReadOnly

from .models import VetClinic
from .serializers import VetClinicSerializer


def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class VetClinicViewSet(viewsets.ModelViewSet):
    queryset = VetClinic.objects.all().order_by("name")
    serializer_class = VetClinicSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name", "address", "phone"]

    @action(detail=False, methods=["get"], url_path="nearby", permission_classes=[AllowAny])
    def nearby(self, request):
        try:
            lat = float(request.query_params.get("lat"))
            lng = float(request.query_params.get("lng"))
        except (TypeError, ValueError):
            return Response({"detail": "lat and lng are required"}, status=400)
        radius_km = float(request.query_params.get("radius_km", 10))
        results = []
        for clinic in self.get_queryset():
            distance = haversine(lat, lng, clinic.lat, clinic.lng)
            if distance <= radius_km:
                data = VetClinicSerializer(clinic).data
                data["distance_km"] = round(distance, 2)
                results.append(data)
        results.sort(key=lambda c: c.get("distance_km", 0))
        return Response(results)
