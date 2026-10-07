#!/usr/bin/env python
"""Setup script to create admin user"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.users.models import User

# Create superuser
if not User.objects.filter(email='admin@test.com').exists():
    User.objects.create_superuser(
        email='admin@test.com',
        password='admin123456'
    )
    print("✅ Superuser created: admin@test.com / admin123456")
else:
    print("✅ Superuser already exists: admin@test.com")

print("✅ Database is properly initialized")
print("\n" + "="*60)
print("BACKEND SETUP COMPLETE!")
print("="*60)
print("\nYou can now run the backend with:")
print("  python manage.py runserver")
print("\nAPI Documentation:")
print("  http://localhost:8000/api/docs/")
print("\nAdmin Panel:")
print("  http://localhost:8000/admin/")
print("  Email: admin@test.com")
print("  Password: admin123456")
