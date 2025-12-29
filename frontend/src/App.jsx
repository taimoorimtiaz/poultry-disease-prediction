import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { settingsService } from './services/api'
import PrivateRoute from './components/PrivateRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Dashboard'
import UploadCropAnalyze from './pages/UploadCropAnalyze'
import Result from './pages/Result'
import History from './pages/History'
import KnowledgeBase from './pages/KnowledgeBase'
import Inventory from './pages/Inventory'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Maintenance from './pages/Maintenance'

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  const isMaintenancePage = location.pathname === '/maintenance';

  // Global maintenance guard: if maintenance ON and user is non-admin, force Maintenance page
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const { data } = await settingsService.get()
        const maintenance = !!data?.maintenance_mode
        const isAdmin = user?.role === 'admin'
        const whitelist = ['/', '/signin', '/signup', '/maintenance']
        if (!cancelled && maintenance && !isAdmin && !whitelist.includes(location.pathname)) {
          navigate('/maintenance', { replace: true })
        }
      } catch {
        // ignore
      }
    }
    check()
    return () => { cancelled = true }
  }, [location.pathname, user?.role, navigate])

  return (
    <div className="app-shell flex flex-col min-h-screen relative">
      {!isLandingPage && (
        <>
          <span className="floating-shape -left-10 top-10" aria-hidden="true" />
          <span className="floating-shape secondary -right-12 top-20" aria-hidden="true" />
        </>
      )}
      {!isLandingPage && !isAuthPage && !isMaintenancePage && <Header />}
      <main className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><UploadCropAnalyze /></PrivateRoute>} />
          <Route path="/result/:id" element={<PrivateRoute><Result /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/knowledge" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        </Routes>
      </main>
      {!isLandingPage && !isMaintenancePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
