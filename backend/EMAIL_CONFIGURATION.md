# Email Configuration Guide for OTP Functionality

This guide will help you configure real email sending for OTP (One-Time Password) verification in the PoultryAI application.

## 📧 Email Provider Setup

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google," enable **2-Step Verification**
4. Follow the setup wizard

#### Step 2: Generate App Password
1. Go to **App passwords**: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "PoultryAI" as the name
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

#### Step 3: Update .env File
Edit `backend/.env` file:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=PoultryAI <your-email@gmail.com>
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `your-16-character-app-password` with the app password from Step 2

---

### Option 2: Outlook/Hotmail

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-outlook-password
DEFAULT_FROM_EMAIL=PoultryAI <your-email@outlook.com>
```

---

### Option 3: Yahoo Mail

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yahoo.com
EMAIL_HOST_PASSWORD=your-yahoo-app-password
DEFAULT_FROM_EMAIL=PoultryAI <your-email@yahoo.com>
```

**Note:** Yahoo also requires app passwords. Generate one at: https://login.yahoo.com/account/security

---

### Option 4: Custom SMTP Server

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@your-domain.com
EMAIL_HOST_PASSWORD=your-password
DEFAULT_FROM_EMAIL=PoultryAI <your-email@your-domain.com>
```

---

## 🧪 Testing Email Configuration

### Method 1: Using Django Shell

```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email from PoultryAI',
    'If you receive this, your email is configured correctly!',
    settings.DEFAULT_FROM_EMAIL,
    ['recipient@example.com'],
    fail_silently=False,
)
```

### Method 2: Using the API

1. Start the backend server:
```bash
cd backend
python manage.py runserver
```

2. Send a test OTP request:
```bash
curl -X POST http://localhost:8000/api/auth/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com", "purpose": "signup"}'
```

3. Check your email inbox for the OTP code

---

## 🔧 Troubleshooting

### "SMTPAuthenticationError"
- **Gmail:** Make sure you're using an App Password, not your regular password
- **Outlook/Yahoo:** Verify your credentials are correct
- Check that 2-Step Verification is enabled (required for Gmail)

### "Connection refused" or "Timeout"
- Check that `EMAIL_PORT` is correct (usually 587 for TLS)
- Verify your firewall isn't blocking SMTP connections
- Try port 465 with `EMAIL_USE_SSL=True` instead of `EMAIL_USE_TLS`

### Emails not arriving
- Check your spam/junk folder
- Verify the recipient email is correct
- Check Django logs for error messages
- Ensure `EMAIL_HOST_USER` matches `DEFAULT_FROM_EMAIL`

### "Server does not support STARTTLS"
- Change to SSL: Set `EMAIL_PORT=465` and use `EMAIL_USE_SSL=True` instead of `EMAIL_USE_TLS`

---

## 🔒 Security Best Practices

1. **Never commit .env file to Git**
   - The `.env` file is already in `.gitignore`
   - Never share your email passwords or app passwords

2. **Use App Passwords**
   - Always use app-specific passwords instead of your main account password
   - Revoke app passwords if they're compromised

3. **Environment Variables**
   - Keep email credentials in `.env` file only
   - Use different credentials for production and development

4. **Rate Limiting**
   - The API has built-in rate limiting for OTP requests
   - Maximum 10 OTP requests per hour per IP

---

## 🚀 Production Recommendations

For production environments, consider using dedicated email services:

### 1. SendGrid (Recommended)
- Free tier: 100 emails/day
- Reliable delivery
- Easy setup

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

### 2. Amazon SES
- Very cost-effective
- High deliverability
- Requires AWS account

### 3. Mailgun
- Free tier: 5,000 emails/month
- Good for transactional emails

---

## 📝 Development Mode

If email is not configured, the system will:
1. Print OTP codes to the console
2. Return a debug response with the error message
3. Still allow OTP verification to work

**Console Output Example:**
```
============================================================
📧 OTP EMAIL (Failed to send via SMTP)
============================================================
To: user@example.com
Purpose: Signup
OTP Code: 123456
Expires: 10 minutes
Error: [Errno 61] Connection refused
============================================================
```

---

## ✅ Verification Checklist

- [ ] 2-Step Verification enabled (Gmail)
- [ ] App Password generated
- [ ] `.env` file updated with email credentials
- [ ] Backend server restarted after configuration
- [ ] Test email sent successfully
- [ ] OTP received in inbox
- [ ] OTP verification works in the app

---

## 📞 Support

If you need help:
1. Check the Django logs: `backend/logs/` (if configured)
2. Run server in debug mode to see detailed errors
3. Verify all environment variables are loaded correctly

---

## 🎯 Quick Start (Gmail)

```bash
# 1. Update .env with your Gmail credentials
nano backend/.env

# 2. Restart the backend server
cd backend
python manage.py runserver

# 3. Test by signing up with OTP enabled
# You should receive an email with the OTP code
```

---

**Last Updated:** December 27, 2025
**Version:** 1.0.0
