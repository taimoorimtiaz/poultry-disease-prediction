# Testing Guide

This document provides comprehensive instructions for testing the Poultry Disease Prediction System, including unit tests, integration tests, and manual testing procedures.

## Table of Contents

1. [Backend Testing](#backend-testing)
2. [Frontend Testing](#frontend-testing)
3. [Integration Testing](#integration-testing)
4. [Manual Testing Checklist](#manual-testing-checklist)
5. [CI/CD Testing](#cicd-testing)
6. [Performance Testing](#performance-testing)

## Backend Testing

### Setup

1. **Ensure test database is configured**:
   ```bash
   cd backend
   ```

2. **Run all tests**:
   ```bash
   python manage.py test
   ```

3. **Run specific app tests**:
   ```bash
   # Test user authentication
   python manage.py test apps.users

   # Test analysis functionality
   python manage.py test apps.analysis
   ```

4. **Run with coverage**:
   ```bash
   pip install coverage
   coverage run --source='.' manage.py test
   coverage report
   coverage html  # Generates HTML coverage report in htmlcov/
   ```

### Test Structure

**apps/users/tests.py**:
- ✅ User signup with valid data
- ✅ Duplicate email validation
- ✅ Missing required fields validation
- ✅ User login with correct credentials
- ✅ Login with invalid credentials
- ✅ JWT token generation on signup/login
- ✅ Token refresh functionality
- ✅ Get current user info (/me endpoint)
- ✅ Unauthenticated access rejection
- ✅ Role-based permission checks (user vs admin)

**apps/analysis/test_analysis.py**:
- ✅ Image upload with valid JPEG/PNG
- ✅ Authentication requirement for upload
- ✅ File size validation (<8MB)
- ✅ Thumbnail generation
- ✅ Mock model predictions structure
- ✅ Analysis result retrieval by ID
- ✅ User-specific analysis history
- ✅ Analysis status tracking
- ✅ Model loader mock behavior
- ✅ Confidence score format validation (0.0-1.0)

### Writing New Backend Tests

Example test structure:

```python
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User

class MyFeatureTests(TestCase):
    def setUp(self):
        """Set up test data before each test method."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            name='Test User'
        )
    
    def test_feature_functionality(self):
        """Test description of what this tests."""
        # Arrange: prepare test data
        # Act: perform the action
        # Assert: verify the result
        response = self.client.get('/api/endpoint/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Common Testing Commands

```bash
# Run tests with verbose output
python manage.py test --verbosity=2

# Run only failed tests from previous run
python manage.py test --failed

# Run tests in parallel (faster)
python manage.py test --parallel

# Keep test database after run (for inspection)
python manage.py test --keepdb

# Run specific test class
python manage.py test apps.users.tests.UserAuthenticationTests

# Run specific test method
python manage.py test apps.users.tests.UserAuthenticationTests.test_user_signup_success
```

## Frontend Testing

### Setup

1. **Install testing dependencies**:
   ```bash
   cd frontend
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
   ```

2. **Update package.json** (already configured):
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Run tests with UI**:
   ```bash
   npm run test:ui
   ```

5. **Generate coverage report**:
   ```bash
   npm install --save-dev @vitest/coverage-v8
   npm run test:coverage
   ```

### Test Structure

**src/test/components.test.jsx**:
- ✅ AnimateAnalyzing component renders
- ✅ Analysis message cycling
- ✅ ResultCard displays predictions correctly
- ✅ Confidence bar width calculation
- ✅ Medicine recommendations display
- ✅ Header navigation for authenticated/unauthenticated users
- ✅ Admin link visibility for admin users
- ✅ Logout functionality
- ✅ LocalStorage token management
- ✅ Email format validation
- ✅ Password strength validation

### Writing New Frontend Tests

Example test structure:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    await userEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### Common Testing Queries

```jsx
// Query by text content
screen.getByText('Login')
screen.getByText(/login/i)  // Case-insensitive regex

// Query by role
screen.getByRole('button')
screen.getByRole('textbox', { name: /email/i })

// Query by label text
screen.getByLabelText('Email')

// Query by placeholder
screen.getByPlaceholderText('Enter email')

// Query by test ID (add data-testid attribute)
screen.getByTestId('custom-element')

// Async queries (for elements that appear later)
await screen.findByText('Loading complete')
```

## Integration Testing

### End-to-End User Flows

#### 1. Complete Authentication Flow

**Objective**: Test user signup → login → access protected route → logout

```bash
# Start both servers
# Backend: python manage.py runserver
# Frontend: npm run dev

# Manual steps:
1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Fill form: email, name, password
4. Submit and verify redirect to dashboard
5. Verify JWT tokens in browser DevTools > Application > Local Storage
6. Navigate to /upload
7. Upload image and verify analysis result
8. Click logout and verify redirect to home
```

**Automated Test** (using Playwright or Cypress):

```javascript
// example.spec.js
test('complete user flow', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('text=Sign Up')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/dashboard/)
})
```

#### 2. Image Upload and Analysis Flow

1. Login with test user
2. Navigate to `/upload`
3. Drop test image (use `frontend/public/test-poultry.jpg` if exists)
4. Crop image with zoom/pan
5. Submit for analysis
6. Wait for analyzing animation (minimum 1 second)
7. Verify redirect to `/result/{id}`
8. Check predictions display with confidence bars
9. Verify medicine recommendations shown
10. Test "Download PDF Report" button
11. Test "Find Nearby Vets" button (map modal opens)
12. Navigate to `/history` and verify analysis appears

#### 3. Admin Dashboard CRUD Flow

1. Login with admin user (role='admin')
2. Navigate to `/admin/dashboard`
3. **Diseases Tab**:
   - Click "Add Disease"
   - Fill form and submit
   - Verify disease appears in table
   - Edit disease name
   - Delete disease (confirm modal)
4. **Medicines Tab**:
   - Add medicine linked to disease
   - Verify disease dropdown shows correct options
5. **Vets Tab**:
   - Add vet clinic with lat/lng coordinates
   - Verify coordinates are numbers
6. **Users Tab**:
   - View all users
   - Change user role to 'vet'
   - Toggle active status

### API Integration Testing

**Test API responses manually**:

```bash
# 1. Signup
curl -X POST http://localhost:8000/api/users/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}'

# 2. Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Save the access token from response

# 3. Get user info
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Upload image (replace path)
curl -X POST http://localhost:8000/api/analysis/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/poultry-image.jpg"

# 5. Get analysis result
curl -X GET http://localhost:8000/api/analysis/{id}/result/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 6. List diseases
curl -X GET http://localhost:8000/api/diseases/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Manual Testing Checklist

### Authentication & Authorization

- [ ] User can sign up with valid email/password
- [ ] Duplicate email registration is rejected
- [ ] User can log in with correct credentials
- [ ] Login fails with incorrect password
- [ ] JWT access token expires after 15 minutes (requires re-login)
- [ ] Refresh token works to get new access token
- [ ] Unauthenticated users redirected to login on protected routes
- [ ] Admin users can access `/admin/dashboard`
- [ ] Regular users cannot access admin endpoints

### Image Upload & Analysis

- [ ] User can drag-and-drop image to upload area
- [ ] User can click to select file from file browser
- [ ] Only JPEG/PNG files accepted
- [ ] Files larger than 8MB are rejected
- [ ] Cropping modal appears after image selection
- [ ] User can zoom in/out on image in cropper
- [ ] User can drag image to reposition crop area
- [ ] "Analyzing" animation displays for at least 1 second
- [ ] Analysis result shows predicted diseases
- [ ] Confidence percentages displayed correctly
- [ ] Medicine recommendations appear with dosage info
- [ ] Thumbnail generated for analysis history

### Results & Actions

- [ ] PDF report generates and downloads
- [ ] "Find Nearby Vets" opens map modal
- [ ] Map shows user's current location (geolocation permission)
- [ ] Vet clinic markers display on map
- [ ] Distance to each vet clinic calculated correctly
- [ ] Medicine detail modal opens with full information
- [ ] "New Analysis" button navigates back to upload page

### Analysis History

- [ ] History page shows all user's past analyses
- [ ] Analyses display in reverse chronological order (newest first)
- [ ] Each analysis shows thumbnail, date, top prediction
- [ ] Clicking an analysis navigates to result page
- [ ] History is paginated if more than 10 analyses

### Knowledge Base

- [ ] All diseases listed with descriptions
- [ ] Search box filters diseases by name
- [ ] Clicking disease opens detail modal
- [ ] Modal shows symptoms, treatment, prevention
- [ ] Sample images displayed (if available)

### Admin Dashboard

- [ ] Only admin users can access
- [ ] Tab navigation works (Diseases, Medicines, Vets, Users, Inventory)
- [ ] **Diseases**: Create, read, update, delete operations
- [ ] **Medicines**: CRUD with disease relationship dropdown
- [ ] **Vets**: CRUD with lat/lng coordinate inputs
- [ ] **Users**: View all users, change roles, toggle active status
- [ ] **Inventory**: CRUD with expiry date tracking, CSV export button downloads file

### Responsive Design

- [ ] Mobile view (<768px): Navigation collapses to hamburger menu
- [ ] Tablet view (768-1024px): Grid layouts adapt
- [ ] Desktop view (>1024px): Full layout with sidebar
- [ ] Images scale properly on all screen sizes
- [ ] Forms are usable on mobile devices
- [ ] Modals display correctly on small screens

### Error Handling

- [ ] Network errors display user-friendly messages
- [ ] Form validation errors shown inline
- [ ] 401 errors trigger automatic token refresh
- [ ] 403 errors redirect to unauthorized page
- [ ] 404 errors show "Not Found" page
- [ ] API rate limiting shows appropriate message (10 uploads/hour)

## CI/CD Testing

### GitHub Actions Workflow

The `.github/workflows/ci.yml` file defines automated testing on every push/PR:

**Jobs**:
1. **backend-tests**: Runs Django tests on Python 3.9, 3.10, 3.11 with PostgreSQL
2. **backend-lint**: Checks code formatting with Black, isort, Flake8
3. **frontend-tests**: Runs ESLint and builds frontend
4. **security-scan**: Checks for vulnerabilities with `safety` (Python) and `npm audit`
5. **code-quality**: Runs CodeQL analysis for JavaScript and Python

### Triggering CI Locally

**Test backend locally before pushing**:
```bash
cd backend

# Run linting
pip install black isort flake8
black --check .
isort --check-only .
flake8 . --max-line-length=120 --exclude=migrations,venv

# Run tests
python manage.py test
```

**Test frontend locally**:
```bash
cd frontend

# Run linting
npm run lint

# Build project
npm run build

# Check for vulnerabilities
npm audit
```

### Viewing CI Results

1. Push code to GitHub
2. Navigate to repository → "Actions" tab
3. Click on latest workflow run
4. View job logs for each step
5. Fix any failures and push again

## Performance Testing

### Backend Performance

**Test endpoint response times**:
```bash
# Install Apache Bench
# Windows: Download from https://www.apachelounge.com/download/
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json http://localhost:8000/api/users/login/

# login.json content:
# {"email":"test@example.com","password":"TestPass123!"}

# Test disease list endpoint (with auth header)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/diseases/
```

**Expected Results**:
- Authentication endpoints: < 200ms average
- Read-only endpoints: < 100ms average
- Image upload: < 2s average (depends on image size)
- PDF generation: < 1s average

### Frontend Performance

**Use Lighthouse audit**:
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance" and "Best Practices"
4. Click "Generate report"

**Target Scores**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

### Database Query Optimization

**Enable Django Debug Toolbar** (development only):
```bash
pip install django-debug-toolbar
```

Add to `settings.py`:
```python
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

Monitor queries for N+1 problems and add `select_related()` or `prefetch_related()` where needed.

## Troubleshooting Tests

### Backend Test Failures

**Issue**: `django.db.utils.OperationalError: database "test_poultry_db" does not exist`
- **Solution**: Test database is created automatically, but ensure PostgreSQL is running

**Issue**: Tests fail with migration errors
- **Solution**: `python manage.py makemigrations --check` then fix migrations

**Issue**: `ModelNotFoundError` in model loader tests
- **Solution**: This is expected behavior when no real model exists (mock is used)

### Frontend Test Failures

**Issue**: `ReferenceError: document is not defined`
- **Solution**: Ensure `vitest.config.js` has `environment: 'jsdom'`

**Issue**: `Cannot find module '@testing-library/react'`
- **Solution**: Run `npm install --save-dev @testing-library/react @testing-library/jest-dom`

**Issue**: Tests fail with router errors
- **Solution**: Wrap components in `<BrowserRouter>` for testing

### Integration Test Issues

**Issue**: Axios 401 errors even with valid token
- **Solution**: Check token expiry (15 min default), use refresh token

**Issue**: CORS errors when frontend calls backend
- **Solution**: Verify `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:5173`

**Issue**: File upload fails in tests
- **Solution**: Use `SimpleUploadedFile` from `django.core.files.uploadedfile`

## Test Coverage Goals

**Backend**:
- Overall coverage: > 80%
- Critical paths (auth, analysis): > 90%
- Admin CRUD: > 70%

**Frontend**:
- Component coverage: > 75%
- Service layer: > 85%
- Context providers: > 90%

**Generate Coverage Reports**:
```bash
# Backend
coverage run --source='.' manage.py test
coverage html
open htmlcov/index.html

# Frontend
npm run test:coverage
open coverage/index.html
```

## Best Practices

1. **Write tests before fixing bugs** (TDD approach)
2. **Use descriptive test names** (`test_user_cannot_delete_other_users_analysis`)
3. **Keep tests independent** (no test should depend on another)
4. **Use fixtures/factories** for test data generation
5. **Mock external services** (don't make real API calls in tests)
6. **Test edge cases** (empty data, very long strings, special characters)
7. **Cleanup after tests** (`setUp` and `tearDown` methods)
8. **Run tests before committing** (add to git pre-commit hook)

## Resources

- **Django Testing**: https://docs.djangoproject.com/en/stable/topics/testing/
- **DRF Testing**: https://www.django-rest-framework.org/api-guide/testing/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Vitest**: https://vitest.dev/guide/
- **Playwright**: https://playwright.dev/ (for E2E tests)
