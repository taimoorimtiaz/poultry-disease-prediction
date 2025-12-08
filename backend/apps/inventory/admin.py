from django.contrib import admin

from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("item_name", "user", "quantity", "expiry_date")
    search_fields = ("item_name", "user__email")
