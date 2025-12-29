from django.http import JsonResponse, HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.template.loader import render_to_string
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import os

from .models import SiteSetting


class MaintenanceModeMiddleware(MiddlewareMixin):
    """Block non-admin users when maintenance mode is ON."""

    def process_request(self, request):
        settings_obj = SiteSetting.get_solo()
        if not settings_obj.maintenance_mode:
            return None

        # Check Django session user first
        user = getattr(request, "user", None)
        
        # If not authenticated via session, try JWT
        if not user or not user.is_authenticated:
            jwt_auth = JWTAuthentication()
            try:
                auth_result = jwt_auth.authenticate(request)
                if auth_result is not None:
                    user, _ = auth_result
                    request.user = user
            except (AuthenticationFailed, Exception):
                pass
        
        # Check if user is admin
        is_admin = bool(user and user.is_authenticated and (user.role == "admin" or user.is_staff or user.is_superuser))

        # Allow admin, Django admin URLs, static/admin paths, and auth endpoints
        if is_admin or request.path.startswith('/admin') or request.path.startswith('/static/') or request.path.startswith('/media/'):
            return None
        
        # Allow auth endpoints so frontend can authenticate and fetch user info
        if request.path.startswith('/api/auth/') and request.method in ['GET', 'POST']:
            return None

        # For API requests return JSON 503
        if request.path.startswith('/api/'):
            return JsonResponse({"message": "Site under maintenance. Please try again later."}, status=503)

        # For others return maintenance page HTML
        try:
            html_content = render_to_string('maintenance.html')
            return HttpResponse(html_content, status=503)
        except Exception:
            # Fallback if template not found
            return HttpResponse("<h1>Maintenance</h1><p>We are performing maintenance. Please try again later.</p>", status=503)

