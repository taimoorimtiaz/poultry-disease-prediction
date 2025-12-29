import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const applyTheme = (theme) => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('theme-dark')
    } else {
      root.classList.remove('theme-dark')
    }
  }

  const applyLanguage = (language) => {
    const root = document.documentElement
    root.setAttribute('lang', language || 'en')
  }

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const { data } = await authService.me()
          setUser(data)
          applyTheme(data?.theme || 'light')
          applyLanguage(data?.language || 'en')
        } catch (error) {
          console.error('Failed to fetch user:', error)
          authService.logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    localStorage.setItem('accessToken', data.access)
    localStorage.setItem('refreshToken', data.refresh)
    localStorage.setItem('currentUser', JSON.stringify(data.user))
    setUser(data.user)
    applyTheme(data?.user?.theme || 'light')
    applyLanguage(data?.user?.language || 'en')
    return data
  }

  const signup = async (userData) => {
    const { data } = await authService.signup(userData)
    // Signup now returns tokens, so store them
    localStorage.setItem('accessToken', data.access)
    localStorage.setItem('refreshToken', data.refresh)
    localStorage.setItem('currentUser', JSON.stringify(data.user))
    setUser(data.user)
    applyTheme(data?.user?.theme || 'light')
    applyLanguage(data?.user?.language || 'en')
    return data
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    localStorage.removeItem('currentUser')
    applyTheme('light')
    applyLanguage('en')
  }

  const updateUser = (userData) => {
    setUser(userData)
    try { localStorage.setItem('currentUser', JSON.stringify(userData)) } catch {}
    applyTheme(userData?.theme || 'light')
    applyLanguage(userData?.language || 'en')
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
