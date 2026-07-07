import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Redirects to /login if not authenticated, preserving the intended destination.
// If `allow` is set, also redirects users of the wrong account type to their own space
// (a Cubi platform account can't reach /school, a school account can't reach /admin).
export function ProtectedRoute({ children, allow }: { children: React.ReactNode; allow?: 'cubi' | 'ecole' }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allow && user && user.type !== allow) {
    return <Navigate to={user.type === 'cubi' ? '/admin' : '/school'} replace />
  }

  return <>{children}</>
}
