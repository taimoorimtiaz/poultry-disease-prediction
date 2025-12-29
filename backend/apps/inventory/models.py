from __future__ import annotations

from django.conf import settings
from django.db import models


class InventoryItem(models.Model):
    CATEGORY_CHOICES = [
        ('feed', 'Feed'),
        ('vaccine', 'Vaccine'),
        ('medicine', 'Medicine'),
        ('equipment', 'Equipment'),
        ('other', 'Other'),
    ]
    
    UNIT_CHOICES = [
        ('kg', 'Kilograms'),
        ('g', 'Grams'),
        ('l', 'Liters'),
        ('ml', 'Milliliters'),
        ('units', 'Units'),
        ('boxes', 'Boxes'),
        ('bags', 'Bags'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, choices=UNIT_CHOICES, default='kg')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):  # pragma: no cover
        return f"{self.name} ({self.user.email})"
