# Poultry Disease Prediction System

A comprehensive full-stack web application for automated poultry disease prediction using deep learning. The system enables farmers, veterinarians, and researchers to upload poultry images, receive AI-powered disease predictions, access treatment recommendations, and locate nearby veterinary clinics.

## 🚀 Features

### Core Functionality
- **AI-Powered Disease Detection**: Upload poultry images and get instant disease predictions with confidence scores
- **Image Cropping**: Client-side image cropping before upload for optimal analysis
- **Real-time Analysis**: Animated analysis feedback with status tracking
- **Prediction History**: Browse past analyses with thumbnails and confidence indicators
- **Report Generation**: Download PDF reports of analysis results

### Knowledge & Resources
- **Disease Knowledge Base**: Searchable database of poultry diseases with detailed information
- **Medicine Recommendations**: Get dosage and administration guidance for predicted diseases
- **Veterinary Locator**: Find nearby vet clinics using Google Maps integration with distance calculation

### Management & Administration
- **User Management**: Role-based access control (User, Admin, Veterinarian)
- **Inventory Tracking**: Manage medicine inventory with expiry date tracking and CSV export
- **Admin Dashboard**: Comprehensive CRUD interfaces for diseases, medicines, vet clinics, and users

### Security & Performance
- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Rate Limiting**: API throttling to prevent abuse (10 analysis/hour per user)
- **Input Validation**: Server-side validation for file size (<8MB), type (JPEG/PNG), and data integrity
- **Responsive UI**: Mobile-friendly design with Tailwind CSS

## 📁 Project Structure

```
poultry-disease-prediction-full-stack-/
├── backend/                      # Django REST Framework backend
│   ├── backend/                  # Project configuration
│   │   ├── settings.py          # Django settings with security, CORS, JWT
│   │   ├── urls.py              # Root URL configuration
│   │   └── wsgi.py              # WSGI application
│   ├── apps/                    # Django applications
│   │   ├── users/               # User authentication & management
│   │   ├── analysis/            # Image upload & disease prediction
│   │   ├── diseases/            # Disease information management
│   │   ├── medicines/           # Medicine database & recommendations
│   │   ├── vets/                # Veterinary clinic locator
│   │   ├── inventory/           # Medicine inventory tracking
│   │   └── reports/             # PDF report generation
│   ├── media/                   # Uploaded images & generated files
│   ├── model_loader.py          # AI model integration layer
│   ├── manage.py                # Django management commands
│   └── requirements.txt         # Python dependencies
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components (Dashboard, Upload, etc.)
│   │   ├── services/            # API client & service modules
│   │   ├── context/             # React context (AuthContext)
│   │   └── App.jsx              # Root component with routing
│   ├── public/                  # Static assets
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Vite configuration
└── model/                       # Machine learning model directory
    └── README.md                # Model integration guide
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.x + Django REST Framework
- **Authentication**: Simple JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL (psycopg2-binary)
- **Image Processing**: Pillow
- **PDF Generation**: ReportLab
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Task Queue** (optional): Celery + Redis

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.21
- **HTTP Client**: Axios 1.6.2
- **Forms**: Formik 2.4.5 + Yup 1.3.3
- **Animations**: Framer Motion 10.16
- **Image Processing**: react-easy-crop 5.0.4, react-dropzone 14.2.3
- **Maps**: @react-google-maps/api 2.19.2
- **Charts**: Recharts 2.10.3

## 📋 Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 16.x or higher
- **PostgreSQL**: 13 or higher
- **Git**: For version control

## 🚀 Getting Started

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file** in `backend/` directory:
   ```env
   # Django
   DJANGO_SECRET_KEY=your-secret-key-here-generate-with-django
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/poultry_db

   # Model
   MODEL_DIR=u:/Abdul_Haseeb(BAI)/FYP/saim/poultry-disease-prediction-full-stack-/model

   # Google Maps (optional, for vet locator)
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # JWT (optional, defaults provided in settings.py)
   JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
   JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
   ```

6. **Create PostgreSQL database**:
   ```bash
   psql -U postgres
   CREATE DATABASE poultry_db;
   \q
   ```

7. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

8. **Create superuser**:
   ```bash
   python manage.py createsuperuser
   ```

9. **Start development server**:
   ```bash
   python manage.py runserver
   ```

   Backend will run at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** in `frontend/` directory:
   ```env
   VITE_API_BASE=http://localhost:8000
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173`

### Accessing the Application

1. **User Interface**: Navigate to `http://localhost:5173`
2. **API Documentation**: `http://localhost:8000/api/docs/` (Swagger UI)
3. **Django Admin**: `http://localhost:8000/admin/`

### Default Test Users

After running migrations, seed data creates:
- **Diseases**: Coccidiosis, Salmonellosis
- **Medicines**: Amprolium, Enrofloxacin

Create users via signup page or Django admin.

## 🤖 Model Integration

The system uses a **mock model loader** by default for development. To integrate your trained model:

1. **Place your model file** in the `model/` directory:
   - PyTorch: `model.pth` or `model.pt`
   - TensorFlow/Keras: `model.h5`
   - ONNX: `model.onnx`

2. **Update `backend/model_loader.py`**:
   - Import your model class
   - Implement `_load_model()` to load your model
   - Update `predict()` to run inference and format results

3. **Expected prediction output format**:
   ```python
   {
       "predictions": [
           {
               "disease_name": "Coccidiosis",
               "confidence": 0.87,
               "disease_id": 1  # Optional: links to Disease model
           }
       ],
       "recommendations": [
           {
               "medicine_name": "Amprolium",
               "dosage": "10 mg/kg body weight",
               "administration": "Mix in drinking water for 5-7 days",
               "medicine_id": 1  # Optional: links to Medicine model
           }
       ]
   }
   ```

4. **See detailed guide**: `model/README.md`

### Mock Model Behavior

Without a real model, the system returns deterministic mock predictions:
- **Coccidiosis**: 87% confidence
- **Salmonellosis**: 32% confidence
- Includes medicine recommendations from database

This allows full-stack testing without ML dependencies.

## 📊 API Endpoints

### Authentication
- `POST /api/users/signup/` - User registration
- `POST /api/users/login/` - Login (returns access + refresh tokens)
- `POST /api/users/refresh/` - Refresh access token
- `GET /api/users/me/` - Get current user info
- `POST /api/users/change-password/` - Change password

### Analysis
- `POST /api/analysis/upload/` - Upload image and get prediction
- `GET /api/analysis/{id}/status/` - Check analysis status
- `GET /api/analysis/{id}/result/` - Get prediction results
- `GET /api/analysis/history/` - Get user's analysis history

### Diseases
- `GET /api/diseases/` - List diseases (paginated, searchable)
- `POST /api/diseases/` - Create disease (admin only)
- `GET /api/diseases/{id}/` - Get disease details
- `PUT /api/diseases/{id}/` - Update disease (admin only)
- `DELETE /api/diseases/{id}/` - Delete disease (admin only)

### Medicines
- `GET /api/medicines/` - List medicines (filterable by disease_id)
- `POST /api/medicines/` - Create medicine (admin only)
- `GET /api/medicines/{id}/` - Get medicine details
- `PUT /api/medicines/{id}/` - Update medicine (admin only)
- `DELETE /api/medicines/{id}/` - Delete medicine (admin only)

### Vet Clinics
- `GET /api/vets/` - List vet clinics
- `GET /api/vets/nearby/?lat={lat}&lng={lng}&radius={km}` - Find nearby vets
- `POST /api/vets/` - Create vet clinic (admin only)
- `PUT /api/vets/{id}/` - Update vet clinic (admin only)
- `DELETE /api/vets/{id}/` - Delete vet clinic (admin only)

### Inventory
- `GET /api/inventory/` - List user's inventory items
- `POST /api/inventory/` - Add inventory item
- `PUT /api/inventory/{id}/` - Update inventory item
- `DELETE /api/inventory/{id}/` - Delete inventory item
- `GET /api/inventory/export-csv/` - Export inventory as CSV

### Reports
- `POST /api/reports/generate/` - Generate PDF report for analysis
- `GET /api/reports/{id}/download/` - Download PDF report

## 🔐 Environment Variables Reference

### Backend `.env`

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DJANGO_SECRET_KEY` | Django secret key for cryptographic signing | None | ✅ |
| `DJANGO_DEBUG` | Enable debug mode | `False` | ❌ |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `localhost,127.0.0.1` | ❌ |
| `DATABASE_URL` | PostgreSQL connection string | None | ✅ |
| `MODEL_DIR` | Path to ML model directory | `./model` | ❌ |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key for vet locator | None | ❌ |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token expiry time | `15` | ❌ |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token expiry time | `7` | ❌ |

### Frontend `.env`

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE` | Backend API base URL | `http://localhost:8000` | ✅ |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | None | ❌ |

## 🧪 Testing

### Backend Tests

Run Django tests:
```bash
cd backend
python manage.py test
```

Run specific app tests:
```bash
python manage.py test apps.users
python manage.py test apps.analysis
```

### Frontend Tests

Run React component tests (setup required):
```bash
cd frontend
npm test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Image upload with cropping
- [ ] Analysis submission and result display
- [ ] PDF report generation and download
- [ ] Vet clinic search on map
- [ ] Medicine recommendations display
- [ ] Admin CRUD operations (diseases, medicines, vets, users)
- [ ] Inventory management and CSV export
- [ ] Analysis history pagination
- [ ] Knowledge base search
- [ ] Token refresh on 401 errors

## 🚀 Deployment

### Production Configuration

1. **Backend**:
   - Set `DJANGO_DEBUG=False`
   - Configure `DJANGO_ALLOWED_HOSTS` with your domain
   - Use secure `DJANGO_SECRET_KEY` (generate with `django.core.management.utils.get_random_secret_key()`)
   - Set up HTTPS
   - Configure production database (use managed PostgreSQL)
   - Set up static file serving (WhiteNoise or CDN)
   - Configure email backend for password reset
   - Set up Celery workers for background tasks (optional)

2. **Frontend**:
   - Update `VITE_API_BASE` to production backend URL
   - Run `npm run build` to generate production build
   - Serve `dist/` folder with nginx or CDN

3. **Security Checklist**:
   - [ ] Enable HTTPS (Let's Encrypt)
   - [ ] Set secure cookies (`SESSION_COOKIE_SECURE = True`)
   - [ ] Configure CORS for production domain only
   - [ ] Set up database backups
   - [ ] Configure rate limiting on reverse proxy (nginx)
   - [ ] Enable Django's security middleware
   - [ ] Set `X-Frame-Options`, `X-Content-Type-Options` headers

### Recommended Hosting

- **Backend**: Heroku, Railway, DigitalOcean App Platform, AWS Elastic Beanstalk
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Heroku Postgres, AWS RDS, DigitalOcean Managed Database
- **Media Files**: AWS S3, Cloudinary

## 📝 Development Notes

### TODO: Real Model Integration

The current system uses a mock model loader. To integrate a real trained model:

1. Train your model on poultry disease dataset
2. Export model to supported format (PyTorch .pth, TensorFlow .h5, or ONNX)
3. Place model file in `model/` directory
4. Update `backend/model_loader.py`:
   - Import model architecture
   - Implement `_load_model()` method
   - Update `predict()` to use real inference
   - Map predictions to database disease records
5. Test with real poultry images

See `model/README.md` for detailed integration guide.

### Code Quality

- **Backend**: Follow PEP 8, use Black formatter, type hints encouraged
- **Frontend**: ESLint + Prettier configured, use functional components with hooks
- **Git Workflow**: Feature branches, pull requests for code review

### Performance Optimization

- Use Django's `select_related()` and `prefetch_related()` for query optimization
- Implement pagination for large lists (already configured in viewsets)
- Add database indexes on frequently queried fields
- Consider Redis caching for API responses
- Use Celery for long-running tasks (model inference, PDF generation)

### Known Limitations

- File uploads limited to 8MB (configurable in `settings.py`)
- Analysis rate limited to 10 requests/hour per user
- Google Maps API requires billing account for production
- No email notifications (can be added with Django email backend)
- Single-image analysis only (batch upload can be added)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Abdul Haseeb** - Initial work and development

## 🙏 Acknowledgments

- Disease and medicine seed data from veterinary resources
- UI inspiration from modern healthcare dashboards
- Model loader pattern adapted from production ML systems

## 📞 Support

For issues and questions:
- Check `TROUBLESHOOTING.md` in project docs
- Review API documentation at `/api/docs/`
- Consult `model/README.md` for ML integration help
- Open an issue on GitHub

---

**Status**: ✅ Development-ready with mock model | ⏳ Awaiting real model integration for production
