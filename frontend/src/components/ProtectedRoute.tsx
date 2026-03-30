import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useRole } from '../auth/useRole'
import type { UserRole } from '../auth/roles'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
  redirectTo?: string
  children: ReactNode
}

export default function ProtectedRoute({
  allowedRoles = ['Admin'],
  redirectTo = '/dashboard',
  children,
}: ProtectedRouteProps) {
  const location = useLocation()
  const role = useRole()

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
