# Poultry Disease Prediction System

A comprehensive full-stack web application for automated poultry disease prediction using deep learning (EfficientNet-B0). The system enables farmers, veterinarians, and administrators to upload poultry images, receive AI-powered disease predictions with 98.29% accuracy, access treatment recommendations, manage inventory, and locate nearby veterinary clinics.

## 🚀 Features

### Core Functionality
- **AI-Powered Disease Detection**: Upload poultry images and get instant disease predictions with confidence scores
  - Detects 4 disease classes: Coccidiosis, Healthy, Newcastle Disease, Salmonella
  - 98.29% accuracy using EfficientNet-B0
  - Age-aware and flock-size-aware medicine recommendations
- **Image Cropping**: Client-side image cropping before upload for optimal analysis
- **Real-time Analysis**: Animated analysis feedback with status tracking
- **Prediction History**: Browse past analyses with thumbnails and confidence indicators
- **Report Generation**: Download PDF reports of analysis results

### User Management & Authentication
- **OTP-based Email Verification**: Secure 10-minute OTP verification for signup
- **JWT Authentication**: Token-based authentication with automatic refresh
- **Role-based Access Control**: User roles (Farmer, Vet, Admin)
- **Profile Management**: Update name, phone, notification preferences, theme, and language

### Admin Dashboard (6 Tabs)
- **Users Admin**: Manage user roles, activation status, view all registered users
- **Vets & Clinics Admin**: CRUD for veterinary clinics with GPS coordinates
- **Diseases Admin**: Manage disease database with symptoms and treatment notes
- **Medicines Admin**: Dosage, pricing, and side effects management
- **Inventory Admin**: Category-based inventory tracking (Feed, Vaccine, Medicine, Equipment, Supplies)
- **System Admin**: 
  - Maintenance mode toggle (blocks non-admin access site-wide)
  - Signup toggle (allow/disallow new registrations)
  - Email configuration status

### Knowledge & Resources
- **Disease Knowledge Base**: Searchable database of poultry diseases with detailed information
- **Medicine Recommendations**: Get dosage and administration guidance for predicted diseases
- **Veterinary Locator**: Find nearby vet clinics using Google Maps integration with OpenStreetMap fallback

### Security & Performance
- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **OTP Email Verification**: 10-minute expiry, HTML emails with branding
- **Maintenance Mode**: Site-wide enforcement with middleware; admins bypass automatically
- **Input Validation**: Server-side validation for file size, type, and data integrity
- **CORS Protection**: Configured for localhost development
- **Password Hashing**: PBKDF2 with Django's built-in security

## 📁 Project Structure

```
poultry-disease-prediction-full-stack-/
├── backend/                      # Django REST Framework backend
│   ├── backend/                  # Project configuration
│   │   ├── settings.py          # Django settings with security, CORS, JWT
│   │   ├── urls.py              # Root URL configuration
│   │   └── wsgi.py              # WSGI application
│   ├── apps/                    # Django applications
│   │   ├── users/               # User authentication, OTP, SiteSetting model
│   │   │   ├── models.py        # User, OTP, SiteSetting (maintenance/signup toggles)
│   │   │   ├── views.py         # Signup, Login, OTP send/verify, UserViewSet, SiteSettingView
│   │   │   ├── middleware.py    # MaintenanceModeMiddleware with JWT auth
│   │   │   └── templates/       # maintenance.html
│   │   ├── analysis/            # Image upload & disease prediction
│   │   ├── diseases/            # Disease information management
│   │   ├── medicines/           # Medicine database & recommendations
│   │   ├── vets/                # Veterinary clinic locator
│   │   ├── inventory/           # Medicine inventory tracking
│   │   └── reports/             # PDF report generation
│   ├── media/                   # Uploaded images & generated files
│   ├── model_loader.py          # EfficientNet-B0 loader with PyTorch + timm
│   ├── manage.py                # Django management commands
│   ├── requirements.txt         # Python dependencies
│   └── venv/                    # Python virtual environment (not in git)
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.jsx       # Sticky navbar with hamburger menu
│   │   │   ├── PrivateRoute.jsx # Auth + maintenance guard
│   │   │   └── admin/           # 6 admin tabs (Users, Vets, Diseases, Medicines, Inventory, System)
│   │   ├── pages/               # Page components (Dashboard, Upload, Settings, Admin, Maintenance)
│   │   ├── services/            # API client & service modules
│   │   │   └── api.js           # Axios interceptors for JWT, 503 handling, admin detection
│   │   ├── context/             # React context (AuthContext with currentUser persistence)
│   │   └── App.jsx              # Root component with routing + global maintenance guard
│   ├── public/                  # Static assets
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration
│   └── node_modules/            # Node dependencies (not in git)
└── model/                       # Machine learning model directory
    ├── efficientnet_b0_best.pth # Trained model (98.29% accuracy)
    ├── metadata.json            # Class mappings
    ├── history.json             # Training history
    └── README.md                # Model integration guide
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.27 + Django REST Framework
- **Authentication**: Simple JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development), PostgreSQL-ready
- **ML/AI**: PyTorch 2.9.1+cpu, timm (EfficientNet-B0)
- **Image Processing**: Pillow
- **PDF Generation**: ReportLab
- **Email**: Gmail SMTP with TLS encryption (port 587)
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.21
- **HTTP Client**: Axios 1.6.2
- **Animations**: Framer Motion 10.16
- **Image Processing**: react-easy-crop 5.0.4, react-dropzone 14.2.3
- **Maps**: Google Maps JavaScript API + Leaflet 1.9.4 with OpenStreetMap fallback
- **Icons**: react-icons

## 📋 Prerequisites

- **Python**: 3.9 or higher (with PyTorch 2.9.1+cpu and timm)
- **Node.js**: 16.x or higher
- **Git**: For version control
- **Gmail Account**: For OTP email functionality (or any SMTP server)

## 🚀 Getting Started

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbdulHaseeb598/poultry-disease-prediction-full-stack-.git
   cd poultry-disease-prediction-full-stack-
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

4. **Activate virtual environment**:
   - **Windows PowerShell**: `.\venv\Scripts\Activate.ps1`
   - **Windows CMD**: `venv\Scripts\activate.bat`
   - **macOS/Linux**: `source venv/bin/activate`

5. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   
   **Important**: Make sure PyTorch and timm are installed:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   pip install timm
   ```

6. **Create `.env` file** in `backend/` directory:
   ```env
   # Django
   SECRET_KEY=your-secret-key-here-generate-with-django-get-secret-key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # Database (SQLite by default, no configuration needed)
   # For PostgreSQL, uncomment and configure:
   # DATABASE_URL=postgresql://user:password@localhost:5432/poultry_db

   # Email Configuration (REQUIRED for OTP functionality)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-gmail-app-password
   DEFAULT_FROM_EMAIL=PoultryAI <your-email@gmail.com>

   # Google Maps (optional, for vet locator)
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

   **📧 Email Setup for OTP Verification:**
   - For Gmail: Generate an App Password at https://myaccount.google.com/apppasswords
   - Enable 2-Factor Authentication first
   - Use the generated 16-character password in `EMAIL_HOST_PASSWORD`

7. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

8. **Create superuser (admin account)**:
   ```bash
   python manage.py createsuperuser
   ```
   Follow prompts to set email and password.

9. **Start development server (with venv activated)**:
   ```bash
   python manage.py runserver
   ```

   Backend will run at `http://127.0.0.1:8000/`
   
   **✅ You should see**: "Model loaded: 0 missing keys, 0 unexpected keys"

### Frontend Setup

1. **Navigate to frontend directory** (from project root):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** in `frontend/` directory:
   ```env
   VITE_API_BASE=http://localhost:8000/api
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173/`

## 🎯 Usage

1. **Access the application**: Open `http://localhost:5173/` in your browser

2. **Sign Up**: 
   - Click "Sign Up"
   - Enter email, name, password
   - Request OTP via email
   - Enter the 6-digit OTP (expires in 10 minutes)
   - Account created and logged in automatically

3. **Login as Admin**:
   - Use superuser credentials created earlier
   - Access Admin Dashboard at `/admin`
   - Manage users, vets, diseases, medicines, inventory, and system settings

4. **Upload Images**:
   - Navigate to "Upload" page
   - Drag & drop or select poultry image
   - Crop if needed
   - Get AI prediction with confidence scores
   - View medicine recommendations

5. **Admin Features**:
   - **Maintenance Mode**: Toggle to block non-admin access (System tab)
   - **Signup Toggle**: Allow/disallow new registrations (System tab)
   - **User Management**: Change roles, activate/deactivate users (Users tab)
   - **Content Management**: Add/edit diseases, medicines, vet clinics, inventory

## 🔐 Default Credentials

After running `createsuperuser`, use those credentials to login as admin.

**Note**: All new users must verify their email with OTP before accessing the system.

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`

## 🛡️ Security Features

- **JWT Authentication**: Access tokens (15 min) + Refresh tokens (7 days)
- **OTP Email Verification**: 6-digit codes with 10-minute expiry
- **Maintenance Mode**: Middleware enforces site-wide blocks for non-admin users
- **Password Hashing**: PBKDF2 with Django's built-in security
- **CORS Protection**: Configured whitelist
- **Role-based Access**: IsAdmin permission class for protected endpoints

## 🌐 Environment Variables Reference

### Backend `.env`
```env
SECRET_KEY=<django-secret-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<your-email@gmail.com>
EMAIL_HOST_PASSWORD=<gmail-app-password>
DEFAULT_FROM_EMAIL=PoultryAI <your-email@gmail.com>
GOOGLE_MAPS_API_KEY=<optional>
```

### Frontend `.env`
```env
VITE_API_BASE=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=<optional>
```

## 🚨 Troubleshooting

### Backend Issues

**1. Model not loading / Mock predictions (25% confidence)**
```bash
# Ensure venv is activated before starting Django
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
python manage.py runserver
# Check for: "Model loaded: 0 missing keys, 0 unexpected keys"
```

**2. Multiple Django servers running**
```bash
# Windows: Find and kill processes on port 8000
netstat -ano | findstr :8000
taskkill /F /PID <process-id>
```

**3. Email not sending**
- Verify Gmail App Password (not your regular password)
- Enable 2FA on Google account first
- Check `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` in `.env`

**4. Database errors**
```bash
# Reset database
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Issues

**1. White screen / Component errors**
- Check browser console for errors
- Ensure backend is running and accessible
- Verify `VITE_API_BASE` in frontend `.env`

**2. Maintenance page for admins**
- Log out and log back in to refresh JWT token and persist `currentUser`
- Ensure user has `role='admin'` in database

**3. Hamburger menu not closing**
- Already fixed with click-outside detection and overlay
- Refresh the page if persists

## 📦 Deployment

### Backend (Django)
1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_HOSTS` with your domain
3. Configure PostgreSQL database
4. Collect static files: `python manage.py collectstatic`
5. Use gunicorn or uWSGI for production server
6. Set up Nginx as reverse proxy

### Frontend (React)
1. Update `VITE_API_BASE` to production API URL
2. Build: `npm run build`
3. Deploy `dist/` folder to hosting service (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abdul Haseeb**
- GitHub: [@AbdulHaseeb598](https://github.com/AbdulHaseeb598)
- Email: haseebkhansherani787@gmail.com

## 🙏 Acknowledgments

- EfficientNet-B0 model from timm library
- Django REST Framework community
- React and Vite communities
- OpenStreetMap for fallback mapping

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
