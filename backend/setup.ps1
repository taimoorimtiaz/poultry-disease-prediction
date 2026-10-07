<#
Backend setup helper (PowerShell)
Run from project root or from backend folder in PowerShell (run as user):
  cd backend
  .\setup.ps1
#>
Write-Host "Creating Python venv in .\venv (if not exists)"
if (-not (Test-Path .\venv)) {
    python -m venv venv
}
Write-Host "Activating venv and installing dependencies..."
& .\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "Installing PyTorch (CPU) and timm (may take a while)"
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install timm
Write-Host "Running Django migrations"
python manage.py makemigrations
python manage.py migrate
Write-Host "Backend setup complete. Create superuser: python manage.py createsuperuser"
