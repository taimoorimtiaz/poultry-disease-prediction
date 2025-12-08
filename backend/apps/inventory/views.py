from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import InventoryItem
from .serializers import InventoryItemSerializer


class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["item_name"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return InventoryItem.objects.all().order_by("-created_at")
        return InventoryItem.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if self.request.user.role != "admin" and instance.user != self.request.user:
            raise permissions.PermissionDenied("Cannot modify another user's inventory")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != "admin" and instance.user != self.request.user:
            raise permissions.PermissionDenied("Cannot delete another user's inventory")
        instance.delete()

    @action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        import csv
        from django.http import HttpResponse

        queryset = self.get_queryset()
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=inventory.csv"
        writer = csv.writer(response)
        writer.writerow(["item_name", "quantity", "expiry_date", "user_email"])
        for item in queryset:
            writer.writerow([item.item_name, item.quantity, item.expiry_date, item.user.email])
        return response
