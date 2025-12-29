from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, OTP


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ("email", "name", "role", "is_staff", "is_active", "created_at")
    list_filter = ("role", "is_staff", "is_active")
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "phone")}),
        ("Preferences", {"fields": ("email_notifications", "sms_notifications", "theme", "language")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "role", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )
    search_fields = ("email", "name")


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("email", "purpose", "otp", "is_verified", "created_at", "expires_at")
    list_filter = ("purpose", "is_verified")
    search_fields = ("email", "otp")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
