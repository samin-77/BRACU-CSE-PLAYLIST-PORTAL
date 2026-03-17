import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { FullPageSpinner } from './Spinner.jsx'

export function RequireAuth() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageSpinner label="Checking session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}

