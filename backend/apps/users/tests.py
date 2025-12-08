from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthTests(APITestCase):
    def test_signup_and_login_flow(self):
        payload = {"email": "test@example.com", "name": "Tester", "password": "testpassword"}
        resp = self.client.post(reverse("signup"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        login_resp = self.client.post(reverse("login"), {"email": payload["email"], "password": payload["password"]}, format="json")
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_resp.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_resp.data['access']}")
        me_resp = self.client.get(reverse("me"))
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data["email"], payload["email"])


class ModelLoaderMockTest(APITestCase):
    def test_placeholder_returns_mock(self):
        from backend import model_loader

        prediction = model_loader.model_loader.predict(b"fake-bytes")
        self.assertIn("predictions", prediction)
