from django.db import models
from django.utils import timezone
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
        otp_code = cls.generate_otp()
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        
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
