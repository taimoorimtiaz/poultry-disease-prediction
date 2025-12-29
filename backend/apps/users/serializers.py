from __future__ import annotations

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OTP, SiteSetting


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # OTP is mandatory for signup
    otp = serializers.CharField(write_only=True, required=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["email", "name", "password", "role", "otp", "access", "refresh"]
        extra_kwargs = {"role": {"required": False}}

    def validate(self, attrs):
        # OTP is required for signup
        email = attrs.get('email')
        otp_code = attrs.pop('otp', None)

        if not otp_code:
            raise serializers.ValidationError({"otp": "OTP is required for signup"})

        try:
            otp_obj = OTP.objects.filter(
                email=email,
                purpose='signup',
                is_verified=False
            ).latest('created_at')
            
            if not otp_obj.verify(otp_code):
                raise serializers.ValidationError({"otp": "Invalid or expired OTP"})
        except OTP.DoesNotExist:
            raise serializers.ValidationError({"otp": "No OTP found for this email"})
        
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user
    
    def to_representation(self, instance):
        """Add JWT tokens to response after user creation"""
        refresh = RefreshToken.for_user(instance)
        return {
            "user": {
                "id": instance.id,
                "email": instance.email,
                "name": instance.name,
                "phone": instance.phone,
                "role": instance.role,
                "email_notifications": instance.email_notifications,
                "sms_notifications": instance.sms_notifications,
                "theme": instance.theme,
                "language": instance.language,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class LoginSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["name"] = user.name
        token["phone"] = user.phone
        token["email_notifications"] = user.email_notifications
        token["sms_notifications"] = user.sms_notifications
        token["theme"] = user.theme
        token["language"] = user.language
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "email_notifications": user.email_notifications,
            "sms_notifications": user.sms_notifications,
            "theme": user.theme,
            "language": user.language,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "name", "phone", "role", 
            "email_notifications", "sms_notifications", 
            "theme", "language",
            "is_active", "is_staff", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "email"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "name", "phone", "email", 
            "email_notifications", "sms_notifications", 
            "theme", "language"
        ]
        read_only_fields = ["email"]


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    otp = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        
        # Verify current password
        if not user.check_password(attrs.get("current_password")):
            raise serializers.ValidationError({"current_password": "Current password is incorrect"})
        
        # Verify OTP
        otp_code = attrs.get("otp")
        try:
            otp_obj = OTP.objects.filter(
                email=user.email,
                purpose='password_change',
                is_verified=False
            ).latest('created_at')
            
            if not otp_obj.verify(otp_code):
                raise serializers.ValidationError({"otp": "Invalid or expired OTP"})
        except OTP.DoesNotExist:
            raise serializers.ValidationError({"otp": "No OTP found"})
        
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
        return user


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        
        # Verify password
        if not user.check_password(attrs.get("password")):
            raise serializers.ValidationError({"password": "Password is incorrect"})
        
        # Verify OTP
        otp_code = attrs.get("otp")
        try:
            otp_obj = OTP.objects.filter(
                email=user.email,
                purpose='delete_account',
                is_verified=False
            ).latest('created_at')
            
            if not otp_obj.verify(otp_code):
                raise serializers.ValidationError({"otp": "Invalid or expired OTP"})
        except OTP.DoesNotExist:
            raise serializers.ValidationError({"otp": "No OTP found"})
        
        return attrs


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['signup', 'password_change', 'delete_account'])


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=['signup', 'password_change', 'delete_account'])


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ["maintenance_mode", "allow_signups", "updated_at"]
        read_only_fields = ["updated_at"]
