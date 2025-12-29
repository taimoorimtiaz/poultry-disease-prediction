from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    LoginView, 
    MeView, 
    RefreshView, 
    SignupView, 
    UserViewSet,
    SendOTPView,
    VerifyOTPView,
    ChangePasswordView,
    DeleteAccountView,
    SiteSettingView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
    path("settings/", SiteSettingView.as_view(), name="site-settings"),
    path("", include(router.urls)),
]
