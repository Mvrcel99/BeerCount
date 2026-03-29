import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAccess } from '../auth/adminAccess'

type ProtectedRouteProps = {
  redirectTo?: string
  children: ReactNode
}

export default function ProtectedRoute({
  redirectTo = '/dashboard',
  children,
}: ProtectedRouteProps) {
  const location = useLocation()
  const hasAccess = useAdminAccess()

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
