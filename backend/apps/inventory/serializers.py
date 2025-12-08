from __future__ import annotations

from rest_framework import serializers

from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ["id", "item_name", "quantity", "expiry_date", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
