from __future__ import annotations

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def _create_user(self, email: str, password: str, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("user", "User"),
        ("admin", "Admin"),
        ("vet", "Vet"),
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    theme = models.CharField(max_length=10, default='light')
    language = models.CharField(max_length=5, default='en')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.email


import random
import string


class OTP(models.Model):
    """Model to store OTPs for various purposes"""
    
    PURPOSE_CHOICES = (
        ('signup', 'Signup'),
        ('password_change', 'Password Change'),
        ('delete_account', 'Delete Account'),
    )
    
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'purpose', 'is_verified']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.purpose} - {self.otp}"
    
    @classmethod
    def generate_otp(cls):
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    @classmethod
    def create_otp(cls, email, purpose):
        """Create a new OTP for the given email and purpose"""
        from datetime import timedelta
        otp_code = cls.generate_otp()
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Invalidate any existing OTPs for this email and purpose
        cls.objects.filter(
            email=email,
            purpose=purpose,
            is_verified=False
        ).update(is_verified=True)
        
        # Create new OTP
        return cls.objects.create(
            email=email,
            otp=otp_code,
            purpose=purpose,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.is_verified and timezone.now() < self.expires_at
    
    def verify(self, otp_input):
        """Verify the OTP"""
        if self.otp == otp_input and self.is_valid():
            self.is_verified = True
            self.save()
            return True
        return False


class SiteSetting(models.Model):
    """Global toggles for maintenance and signup control (singleton)."""

    maintenance_mode = models.BooleanField(default=False)
    allow_signups = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

    def __str__(self) -> str:
        return f"Settings (maintenance={self.maintenance_mode}, allow_signups={self.allow_signups})"
