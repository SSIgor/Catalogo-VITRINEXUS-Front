import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  requirePasswordChanged?: boolean
  superAdminOnly?: boolean
}

export function ProtectedRoute({ requirePasswordChanged = false, superAdminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, requiresPasswordChange, isSuperAdmin } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-paper text-teal">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (requiresPasswordChange && location.pathname !== '/trocar-senha') return <Navigate to="/trocar-senha" replace />
  if (superAdminOnly && !isSuperAdmin) return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}
