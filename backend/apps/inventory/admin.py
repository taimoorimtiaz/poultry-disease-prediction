from django.contrib import admin

from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "category", "quantity", "unit", "expiry_date")
    list_filter = ("category", "unit")
    search_fields = ("name", "user__email", "notes")
