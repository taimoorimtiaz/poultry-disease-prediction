# Quick Setup Guide

This guide will help you set up the Poultry Disease Prediction System on your local machine in under 10 minutes.

## Prerequisites Checklist

Before you begin, ensure you have:
- [ ] Python 3.9+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Gmail account (for OTP emails) or any SMTP server

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AbdulHaseeb598/poultry-disease-prediction-full-stack-.git
cd poultry-disease-prediction-full-stack-
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install PyTorch (if not in requirements.txt)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install timm
```

### 3. Configure Backend Environment

Create `backend/.env` file:

```env
SECRET_KEY=django-insecure-your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Email (REQUIRED for signup OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=PoultryAI <your-email@gmail.com>

# Optional
GOOGLE_MAPS_API_KEY=your-key-here
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication if not already enabled
3. Generate an App Password for "Mail"
4. Use the 16-character password in `.env`

### 4. Initialize Database

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Follow prompts: enter email, name, password
```

### 5. Start Backend Server

```bash
# Make sure venv is activated!
python manage.py runserver
```

**✅ Success Check:** You should see:
```
Model loaded: 0 missing keys, 0 unexpected keys
Loaded model from .../model/efficientnet_b0_best.pth on cpu
Starting development server at http://127.0.0.1:8000/
```

### 6. Frontend Setup (3 minutes)

Open a NEW terminal (keep backend running):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
# Create frontend/.env with:
```

`frontend/.env`:
```env
VITE_API_BASE=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your-key-here
```

### 7. Start Frontend Server

```bash
npm run dev
```

**✅ Success Check:** You should see:
```
VITE v5.4.21  ready in 387 ms
➜  Local:   http://localhost:5173/
```

### 8. Access the Application

1. Open browser: `http://localhost:5173/`
2. Click "Sign Up" to create an account
3. Verify with OTP sent to your email
4. Login and start using the app!

**Admin Access:**
- Login with superuser credentials
- Navigate to `/admin` for the admin dashboard

## Common Issues & Fixes

### Issue: "Module 'torch' not found"
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install timm
```

### Issue: "Model returning 25% confidence"
```bash
# Make sure venv is activated before starting Django:
cd backend
.\venv\Scripts\Activate.ps1  # Windows
python manage.py runserver
```

### Issue: "Email not sending"
- Check Gmail App Password is correct
- Ensure 2FA is enabled on Google account
- Try from a different network if corporate firewall blocks SMTP

### Issue: "Port already in use"
```bash
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /F /PID <process-id>

# Or change port:
python manage.py runserver 8001
```

### Issue: "CORS error in browser"
- Verify `VITE_API_BASE` in frontend/.env is correct
- Ensure backend is running at the specified URL

## Verification Checklist

After setup, verify:
- [ ] Backend running on http://127.0.0.1:8000/
- [ ] Frontend running on http://localhost:5173/
- [ ] Can create account with OTP
- [ ] Can login successfully
- [ ] Can upload image and get prediction
- [ ] Admin can access /admin dashboard
- [ ] Model loads without errors (check backend console)

## Next Steps

1. **Create admin account**: Use superuser credentials
2. **Test OTP**: Sign up a test user
3. **Upload test image**: Use sample poultry image
4. **Explore admin dashboard**: Manage users, diseases, medicines
5. **Toggle maintenance mode**: Test in System admin tab

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review console logs for specific errors
- Ensure all prerequisites are met
- Contact: haseebkhansherani787@gmail.com

## Production Deployment

When ready for production:
1. Set `DEBUG=False` in backend/.env
2. Update `ALLOWED_HOSTS` with your domain
3. Change `SECRET_KEY` to a secure random string
4. Use PostgreSQL instead of SQLite
5. Set up proper static file serving
6. Configure HTTPS/SSL
7. Update CORS settings for production domain
