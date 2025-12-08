from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/auth/", include("apps.users.urls")),
    path("api/analysis/", include("apps.analysis.urls")),
    path("api/diseases/", include("apps.diseases.urls")),
    path("api/medicines/", include("apps.medicines.urls")),
    path("api/vets/", include("apps.vets.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
