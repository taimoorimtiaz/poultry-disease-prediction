import io
from PIL import Image
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import User


def generate_image_file():
    file = io.BytesIO()
    image = Image.new("RGB", (100, 100), color=(155, 0, 0))
    image.save(file, "JPEG")
    file.name = "test.jpg"
    file.seek(0)
    return file


class AnalysisUploadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="password", name="User")

    def test_upload_requires_auth(self):
        resp = self.client.post(reverse("analysis-upload"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_and_result(self):
        self.client.force_authenticate(user=self.user)
        img = generate_image_file()
        resp = self.client.post(reverse("analysis-upload"), {"file": img}, format="multipart")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        analysis_id = resp.data["analysis_id"]
        status_resp = self.client.get(reverse("analysis-status", args=[analysis_id]))
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)
        result_resp = self.client.get(reverse("analysis-result", args=[analysis_id]))
        self.assertEqual(result_resp.status_code, status.HTTP_200_OK)
