import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Close menu on route change or when pressing Escape
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-3">
        <div className="glass-panel rounded-2xl px-5 py-3 flex items-center justify-between border border-white/40 shadow-xl">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                ref={buttonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/50 transition"
                aria-label="Toggle menu"
              >
                <span className={`hamburger-line block w-6 h-0.5 bg-gray-800 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`hamburger-line block w-6 h-0.5 bg-gray-800 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`hamburger-line block w-6 h-0.5 bg-gray-800 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            )}

            <Link to="/" className="flex items-center gap-3">
              <div className="pill shadow-sm">
                <span className="text-xl">🐔</span>
                <span className="font-semibold">Poultry AI</span>
              </div>
              <span className="hidden sm:block text-sm text-gray-500">Health diagnostics made vivid</span>
            </Link>
          </div>

          {/* Right: User info (desktop) */}
          {user && (
            <div className="hidden lg:flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <span className="soft-badge">Realtime</span>
                <span className="text-xs text-gray-500">Signed in as {user.role}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-semibold hidden sm:block">
                  {user.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Slide-out Menu (left) */}
        {user && mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            {/* Panel */}
            <div ref={menuRef} className="fixed top-0 left-0 h-screen w-80 max-w-[85vw] glass-panel border border-white/40 shadow-2xl rounded-r-2xl z-[70] p-4">
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ghost-button px-4 py-3 rounded-lg bg-white/70 text-left font-medium hover:scale-[1.02] transition-all"
                >
                  <span className="mr-2">🏠</span>
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ghost-button px-4 py-3 rounded-lg bg-white/70 text-left font-medium hover:scale-[1.02] transition-all"
                >
                  <span className="mr-2">📤</span>
                  Upload
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ghost-button px-4 py-3 rounded-lg bg-white/70 text-left font-medium hover:scale-[1.02] transition-all"
                >
                  <span className="mr-2">📊</span>
                  History
                </Link>
                <Link
                  to="/inventory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ghost-button px-4 py-3 rounded-lg bg-white/70 text-left font-medium hover:scale-[1.02] transition-all"
                >
                  <span className="mr-2">📦</span>
                  Inventory
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ghost-button px-4 py-3 rounded-lg bg-white/70 text-left font-medium hover:scale-[1.02] transition-all"
                >
                  <span className="mr-2">⚙️</span>
                  Settings
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="ghost-button px-4 py-3 rounded-lg bg-white/70 text-left font-medium hover:scale-[1.02] transition-all"
                  >
                    <span className="mr-2">👑</span>
                    Admin
                  </Link>
                )}

                <div className="border-t border-gray-200/60 my-3"></div>

                <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100/50">
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 ml-6 uppercase tracking-wide">{user.role}</p>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="px-4 py-3 rounded-xl text-white font-semibold glow-button text-left flex items-center gap-2 hover:scale-[1.02] transition-all mt-2"
                >
                  <span className="text-lg">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
