#!/usr/bin/env python
"""
Test Email Configuration Script
Run this script to test if your email settings are configured correctly.
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from apps.users.models import OTP


def test_basic_email():
    """Test basic email sending"""
    print("\n" + "="*60)
    print("Testing Basic Email Configuration")
    print("="*60)
    
    recipient = input("Enter recipient email address: ").strip()
    
    if not recipient:
        print("❌ No email address provided. Exiting.")
        return False
    
    try:
        subject = "Test Email from PoultryAI"
        message = "If you receive this email, your email configuration is working correctly! ✅"
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(
            subject,
            message,
            from_email,
            [recipient],
            fail_silently=False,
        )
        
        print(f"✅ Email sent successfully to {recipient}")
        print(f"📧 Check the inbox for: {recipient}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check your .env file has correct EMAIL_HOST_USER and EMAIL_HOST_PASSWORD")
        print("2. For Gmail, use an App Password (not your regular password)")
        print("3. Ensure EMAIL_HOST and EMAIL_PORT are correct")
        print("\nSee EMAIL_CONFIGURATION.md for detailed setup instructions.")
        return False


def test_html_email():
    """Test HTML email (like OTP emails)"""
    print("\n" + "="*60)
    print("Testing HTML Email (OTP Format)")
    print("="*60)
    
    recipient = input("Enter recipient email address: ").strip()
    
    if not recipient:
        print("❌ No email address provided. Exiting.")
        return False
    
    try:
        # Create a test OTP
        otp_obj = OTP.create_otp(recipient, 'signup')
        
        subject = "Test OTP Email from PoultryAI"
        
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐔 PoultryAI</h1>
                    <p>Test Email - OTP Format</p>
                </div>
                <div class="content">
                    <h2>Test Verification Code</h2>
                    <p>This is a test email to verify your email configuration.</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Test OTP Code:</p>
                        <div class="otp-code">{otp_obj.otp}</div>
                    </div>
                    
                    <p><strong>✅ If you see this, your HTML emails are working correctly!</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_message = f"Test OTP Code: {otp_obj.otp}\n\n✅ If you see this, your email is working!"
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=False)
        
        print(f"✅ HTML email sent successfully to {recipient}")
        print(f"📧 Test OTP Code: {otp_obj.otp}")
        print(f"📬 Check the inbox for: {recipient}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send HTML email: {str(e)}")
        return False


def display_current_settings():
    """Display current email settings (without sensitive data)"""
    print("\n" + "="*60)
    print("Current Email Configuration")
    print("="*60)
    
    print(f"Backend: {settings.EMAIL_BACKEND}")
    print(f"Host: {settings.EMAIL_HOST}")
    print(f"Port: {settings.EMAIL_PORT}")
    print(f"Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")
    print(f"Host User: {settings.EMAIL_HOST_USER if settings.EMAIL_HOST_USER else '❌ NOT SET'}")
    print(f"Host Password: {'✅ SET' if settings.EMAIL_HOST_PASSWORD else '❌ NOT SET'}")
    print("="*60)


def main():
    print("\n🐔 PoultryAI Email Configuration Tester")
    print("="*60)
    
    display_current_settings()
    
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("\n⚠️  WARNING: Email credentials not configured!")
        print("Please update your .env file with:")
        print("  - EMAIL_HOST_USER=your-email@gmail.com")
        print("  - EMAIL_HOST_PASSWORD=your-app-password")
        print("\nSee EMAIL_CONFIGURATION.md for setup instructions.")
        return
    
    while True:
        print("\nSelect a test:")
        print("1. Test Basic Email")
        print("2. Test HTML Email (OTP Format)")
        print("3. Display Current Settings")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            test_basic_email()
        elif choice == '2':
            test_html_email()
        elif choice == '3':
            display_current_settings()
        elif choice == '4':
            print("\n👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted. Goodbye!")
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")
