# PowerShell script to run Django server with activated venv
# Run from anywhere and it will work!

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvActivate = Join-Path $projectPath "venv\Scripts\Activate.ps1"

# Activate virtual environment
& $venvActivate

# Run migrations (if needed)
Write-Host "`n📦 Checking migrations..." -ForegroundColor Cyan
python manage.py migrate --check 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔄 Running migrations..." -ForegroundColor Yellow
    python manage.py migrate --no-input
}

# Start server
Write-Host "`n✅ Starting Django Development Server..." -ForegroundColor Green
Write-Host "🔗 API: http://localhost:8000/api/" -ForegroundColor Cyan
Write-Host "📚 Docs: http://localhost:8000/api/docs/" -ForegroundColor Cyan
Write-Host "👨‍💼 Admin: http://localhost:8000/admin/" -ForegroundColor Cyan
Write-Host "📧 Email: admin@test.com | 🔑 Password: admin123456" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

python manage.py runserver 0.0.0.0:8000
