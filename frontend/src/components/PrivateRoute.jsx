import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { settingsService } from '../services/api'

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const [maintenanceAllowed, setMaintenanceAllowed] = useState(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Check maintenance mode from backend and block non-admin users
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data } = await settingsService.get()
        if (!cancelled) {
          const isAdmin = user?.role === 'admin'
          setMaintenanceAllowed(!(data?.maintenance_mode && !isAdmin))
        }
      } catch (e) {
        if (!cancelled) setMaintenanceAllowed(true)
      }
    }
    run()
    return () => { cancelled = true }
  }, [user])

  if (maintenanceAllowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!maintenanceAllowed) {
    return <Navigate to="/maintenance" replace />
  }

  return children
}
