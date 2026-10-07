#!/usr/bin/env bash
set -e
echo "Creating Python venv in ./venv (if not exists)"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
echo "Activating venv and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "Installing PyTorch (CPU) and timm (may take a while)"
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install timm
echo "Running Django migrations"
python manage.py makemigrations
python manage.py migrate
echo "Backend setup complete. Create superuser: source venv/bin/activate && python manage.py createsuperuser"
