"""
Unit tests for analysis upload, prediction, and history endpoints.
"""
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.analysis.models import SampleImage, AnalysisResult
from PIL import Image
from io import BytesIO


class AnalysisUploadTests(TestCase):
    """Test image upload and analysis workflow."""

    def setUp(self):
        """Set up test client and authenticated user."""
        self.client = APIClient()
        
        # Create and authenticate user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            name='Test User'
        )
        
        # Login and get token
        login_url = reverse('users:login')
        response = self.client.post(login_url, {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }, format='json')
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.upload_url = reverse('analysis:upload')

    def _create_test_image(self, format='JPEG', size=(800, 600)):
        """Helper method to create a test image file."""
        image = Image.new('RGB', size, color='red')
        image_io = BytesIO()
        image.save(image_io, format=format)
        image_io.seek(0)
        return SimpleUploadedFile(
            name=f'test.{format.lower()}',
            content=image_io.read(),
            content_type=f'image/{format.lower()}'
        )

    def test_upload_valid_image(self):
        """Test uploading a valid image file."""
        image_file = self._create_test_image()
        response = self.client.post(self.upload_url, {'image': image_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('predictions', response.data)
        self.assertIn('recommendations', response.data)
        
        # Verify sample image and result were created
        sample_exists = SampleImage.objects.filter(id=response.data['id']).exists()
        self.assertTrue(sample_exists)

    def test_upload_without_authentication(self):
        """Test upload endpoint requires authentication."""
        self.client.credentials()  # Remove authentication
        image_file = self._create_test_image()
        response = self.client.post(self.upload_url, {'image': image_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_png_image(self):
        """Test uploading PNG format image."""
        image_file = self._create_test_image(format='PNG')
        response = self.client.post(self.upload_url, {'image': image_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_without_file(self):
        """Test upload without providing image file."""
        response = self.client.post(self.upload_url, {}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_thumbnail_generated(self):
        """Test that thumbnail is automatically generated."""
        image_file = self._create_test_image()
        response = self.client.post(self.upload_url, {'image': image_file}, format='multipart')
        
        sample = SampleImage.objects.get(id=response.data['id'])
        self.assertTrue(sample.thumbnail.name)  # Thumbnail field is populated

    def test_mock_predictions_structure(self):
        """Test that mock model loader returns expected prediction structure."""
        image_file = self._create_test_image()
        response = self.client.post(self.upload_url, {'image': image_file}, format='multipart')
        
        predictions = response.data['predictions']
        recommendations = response.data['recommendations']
        
        # Validate predictions structure
        self.assertIsInstance(predictions, list)
        self.assertGreater(len(predictions), 0)
        self.assertIn('disease_name', predictions[0])
        self.assertIn('confidence', predictions[0])
        
        # Validate recommendations structure
        self.assertIsInstance(recommendations, list)
        if len(recommendations) > 0:
            self.assertIn('medicine_name', recommendations[0])
            self.assertIn('dosage', recommendations[0])


class AnalysisResultTests(TestCase):
    """Test analysis result retrieval and history endpoints."""

    def setUp(self):
        """Set up test client and sample analysis."""
        self.client = APIClient()
        
        # Create user and authenticate
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            name='Test User'
        )
        
        login_url = reverse('users:login')
        response = self.client.post(login_url, {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }, format='json')
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Create sample image and result
        self.sample = SampleImage.objects.create(user=self.user)
        self.result = AnalysisResult.objects.create(
            sample_image=self.sample,
            status='completed',
            predicted_diseases=[
                {'disease_name': 'Test Disease', 'confidence': 0.9}
            ],
            medicines_recommended=[
                {'medicine_name': 'Test Medicine', 'dosage': '10mg'}
            ]
        )

    def test_get_analysis_result(self):
        """Test retrieving analysis result by ID."""
        result_url = reverse('analysis:result', kwargs={'pk': self.sample.id})
        response = self.client.get(result_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertIn('predictions', response.data)

    def test_get_nonexistent_result(self):
        """Test retrieving result that doesn't exist."""
        result_url = reverse('analysis:result', kwargs={'pk': 99999})
        response = self.client.get(result_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_history(self):
        """Test retrieving user's analysis history."""
        history_url = reverse('analysis:history')
        response = self.client.get(history_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.sample.id)

    def test_history_only_shows_user_analyses(self):
        """Test that history only shows analyses belonging to authenticated user."""
        # Create another user with analysis
        other_user = User.objects.create_user(
            email='other@example.com',
            password='OtherPass123!',
            name='Other User'
        )
        other_sample = SampleImage.objects.create(user=other_user)
        AnalysisResult.objects.create(sample_image=other_sample, status='completed')
        
        # Query history as first user
        history_url = reverse('analysis:history')
        response = self.client.get(history_url)
        
        # Should only see own analysis
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.user.id)


class ModelLoaderTests(TestCase):
    """Test model loader functionality and mock predictions."""

    def test_model_loader_returns_mock_predictions(self):
        """Test that model loader returns mock data when no real model exists."""
        from model_loader import ModelLoader
        
        loader = ModelLoader()
        
        # Create dummy image bytes
        image = Image.new('RGB', (100, 100), color='blue')
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        image_bytes = image_io.getvalue()
        
        # Get prediction
        result = loader.predict(image_bytes)
        
        # Validate structure
        self.assertIn('predictions', result)
        self.assertIn('recommendations', result)
        self.assertIsInstance(result['predictions'], list)
        self.assertIsInstance(result['recommendations'], list)

    def test_model_loader_prediction_confidence_format(self):
        """Test that confidence values are in correct format (0-1)."""
        from model_loader import ModelLoader
        
        loader = ModelLoader()
        image = Image.new('RGB', (100, 100))
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        
        result = loader.predict(image_io.getvalue())
        
        for prediction in result['predictions']:
            confidence = prediction['confidence']
            self.assertGreaterEqual(confidence, 0.0)
            self.assertLessEqual(confidence, 1.0)
            self.assertIsInstance(confidence, float)
