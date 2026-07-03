import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Redirects to /login if not authenticated, preserving the intended destination.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
