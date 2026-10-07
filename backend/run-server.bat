@echo off
REM Batch script to run Django server with activated venv
REM This works in Windows Command Prompt

setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check migrations
echo.
echo 📦 Checking migrations...
python manage.py migrate --check >nul 2>&1
if errorlevel 1 (
    echo 🔄 Running migrations...
    python manage.py migrate --no-input
)

REM Show startup info
echo.
echo ✅ Starting Django Development Server...
echo 🔗 API: http://localhost:8000/api/
echo 📚 Docs: http://localhost:8000/api/docs/
echo 👨‍💼 Admin: http://localhost:8000/admin/
echo 📧 Email: admin@test.com ^| 🔑 Password: admin123456
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start server
python manage.py runserver 0.0.0.0:8000

endlocal
