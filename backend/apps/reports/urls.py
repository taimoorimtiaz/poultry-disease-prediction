from django.urls import path

from .views import ReportDownloadView, ReportGenerateView, ReportListView

urlpatterns = [
    path("", ReportListView.as_view(), name="report-list"),
    path("generate/", ReportGenerateView.as_view(), name="report-generate"),
    path("<int:pk>/download/", ReportDownloadView.as_view(), name="report-download"),
]
