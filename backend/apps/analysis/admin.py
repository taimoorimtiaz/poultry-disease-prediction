from django.contrib import admin

from .models import AnalysisResult, SampleImage


@admin.register(SampleImage)
class SampleImageAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "uploaded_at")
    search_fields = ("user__email",)


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ("id", "sample", "processed_at")
