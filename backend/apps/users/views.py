from __future__ import annotations

from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

from .models import User, OTP, SiteSetting
from .permissions import IsAdmin
from .serializers import (
    LoginSerializer, 
    PasswordChangeSerializer, 
    SignupSerializer, 
    UserSerializer,
    ProfileUpdateSerializer,
    DeleteAccountSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    SiteSettingSerializer,
)

logger = logging.getLogger(__name__)


class SignupView(generics.CreateAPIView):
    """Register a new user with email/password."""

    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):
        settings_obj = SiteSetting.get_solo()
        if not settings_obj.allow_signups:
            return Response({"message": "Signups are disabled by admin"}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class RefreshView(TokenRefreshView):
    pass


class MeView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return ProfileUpdateSerializer
        return UserSerializer


class SendOTPView(generics.GenericAPIView):
    """Send OTP to email for verification"""
    permission_classes = [permissions.AllowAny]
    serializer_class = OTPRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']
        
        # Create OTP
        otp_obj = OTP.create_otp(email, purpose)
        
        # Prepare email content
        purpose_display = purpose.replace("_", " ").title()
        subject = f'Your OTP Code - {purpose_display}'
        
        # Create HTML email
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .otp-box {{ background: white; border: 2px solid #10b981; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; }}
                .warning {{ color: #ef4444; font-size: 14px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐔 PoultryAI</h1>
                    <p>AI-Powered Poultry Disease Detection</p>
                </div>
                <div class="content">
                    <h2>Your Verification Code</h2>
                    <p>You requested a verification code for <strong>{purpose_display}</strong>.</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Your OTP Code:</p>
                        <div class="otp-code">{otp_obj.otp}</div>
                    </div>
                    
                    <p>This code will expire in <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    
                    <div class="warning">
                        ⚠️ Never share this code with anyone. PoultryAI will never ask for your OTP code.
                    </div>
                </div>
                <div class="footer">
                    <p>© 2025 PoultryAI. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version (fallback)
        plain_message = f"""
PoultryAI - Your Verification Code

You requested a verification code for {purpose_display}.

Your OTP Code: {otp_obj.otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

⚠️ Never share this code with anyone. PoultryAI will never ask for your OTP code.

© 2025 PoultryAI. All rights reserved.
This is an automated email. Please do not reply.
        """
        
        # Send email
        email_sent = False
        error_message = None
        
        try:
            # Try to send HTML email
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email]
            )
            msg.attach_alternative(html_message, "text/html")
            msg.send(fail_silently=False)
            email_sent = True
            logger.info(f"OTP email sent successfully to {email}")
        except Exception as e:
            error_message = str(e)
            logger.error(f"Failed to send OTP email to {email}: {error_message}")
            
            # Fallback: Print to console for development
            print("\n" + "="*60)
            print(f"📧 OTP EMAIL (Failed to send via SMTP)")
            print("="*60)
            print(f"To: {email}")
            print(f"Purpose: {purpose_display}")
            print(f"OTP Code: {otp_obj.otp}")
            print(f"Expires: 10 minutes")
            print(f"Error: {error_message}")
            print("="*60 + "\n")
        
        # Return response
        response_data = {
            "message": "OTP sent successfully" if email_sent else "OTP generated (check console in development)",
            "email": email,
            "email_sent": email_sent
        }
        
        # In development, include additional info
        if settings.DEBUG and not email_sent:
            response_data["debug_info"] = {
                "error": error_message,
                "note": "Check console output for OTP code. Configure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env file."
            }
        
        return Response(response_data, status=status.HTTP_200_OK)


class VerifyOTPView(generics.GenericAPIView):
    """Verify OTP"""
    permission_classes = [permissions.AllowAny]
    serializer_class = OTPVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']
        purpose = serializer.validated_data['purpose']
        
        try:
            otp_obj = OTP.objects.filter(
                email=email,
                purpose=purpose,
                is_verified=False
            ).latest('created_at')
            
            if otp_obj.verify(otp_code):
                return Response({
                    "message": "OTP verified successfully"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "message": "Invalid or expired OTP"
                }, status=status.HTTP_400_BAD_REQUEST)
        except OTP.DoesNotExist:
            return Response({
                "message": "No OTP found for this email and purpose"
            }, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(generics.GenericAPIView):
    """Change user password with OTP verification"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Password changed successfully"
        }, status=status.HTTP_200_OK)


class DeleteAccountView(generics.GenericAPIView):
    """Delete user account with password and OTP verification"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DeleteAccountSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.delete()
        
        return Response({
            "message": "Account deleted successfully"
        }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "name"]

    @action(detail=True, methods=["post"], url_path="change-password")
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated"}, status=status.HTTP_200_OK)


class SiteSettingView(generics.RetrieveUpdateAPIView):
    """Read/update global site settings (maintenance, signup toggle)."""

    serializer_class = SiteSettingSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_object(self):
        return SiteSetting.get_solo()
