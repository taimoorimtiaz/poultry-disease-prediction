import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <span>🐔</span>
            <span>Poultry Disease Prediction</span>
          </Link>
          {user && (
            <div className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-primary transition">
                Dashboard
              </Link>
              <Link to="/upload" className="text-gray-700 hover:text-primary transition">
                Upload
              </Link>
              <Link to="/history" className="text-gray-700 hover:text-primary transition">
                History
              </Link>
              <Link to="/knowledge" className="text-gray-700 hover:text-primary transition">
                Knowledge
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-primary transition">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
