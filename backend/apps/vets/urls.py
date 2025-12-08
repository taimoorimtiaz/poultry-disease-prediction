from rest_framework.routers import DefaultRouter

from .views import VetClinicViewSet

router = DefaultRouter()
router.register(r"", VetClinicViewSet, basename="vetclinic")

urlpatterns = router.urls
