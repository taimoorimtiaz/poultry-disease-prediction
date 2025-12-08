from django.contrib import admin

from .models import VetClinic


@admin.register(VetClinic)
class VetClinicAdmin(admin.ModelAdmin):
    list_display = ("name", "lat", "lng")
    search_fields = ("name", "address")
