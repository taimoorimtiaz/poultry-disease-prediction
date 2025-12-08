from django.urls import path

from .views import AnalysisResultView, AnalysisStatusView, AnalysisUploadView, HistoryView

urlpatterns = [
    path("upload/", AnalysisUploadView.as_view(), name="analysis-upload"),
    path("history/", HistoryView.as_view(), name="analysis-history"),
    path("<int:pk>/status/", AnalysisStatusView.as_view(), name="analysis-status"),
    path("<int:pk>/result/", AnalysisResultView.as_view(), name="analysis-result"),
]
