export type UserRole = 'Admin' | 'Kurssprecher' | 'Student'

export type RoleAssignments = Record<string, UserRole>

const ROLE_STORAGE_KEY = 'bierlog.role'
const ROLE_ASSIGNMENTS_KEY = 'bierlog.role.assignments'
const ROLE_CHANGE_EVENT = 'bierlog-role-change'

export const ROLE_OPTIONS: UserRole[] = ['Admin', 'Kurssprecher', 'Student']

const isBrowser = typeof window !== 'undefined'

export function resolveRole(): UserRole {
  if (!isBrowser) return 'Student'
  const stored = window.localStorage.getItem(ROLE_STORAGE_KEY)
  if (stored === 'Admin' || stored === 'Kurssprecher' || stored === 'Student') {
    return stored
  }
  const envRole = import.meta.env.VITE_USER_ROLE
  if (envRole === 'Admin' || envRole === 'Kurssprecher' || envRole === 'Student') {
    return envRole
  }
  return 'Student'
}

export function setCurrentRole(role: UserRole) {
  if (!isBrowser) return
  window.localStorage.setItem(ROLE_STORAGE_KEY, role)
  window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
}

export function subscribeToRoleChange(callback: () => void) {
  if (!isBrowser) return () => undefined
  const handler = () => callback()
  const storageHandler = (event: StorageEvent) => {
    if (event.key === ROLE_STORAGE_KEY) {
      callback()
    }
  }
  window.addEventListener(ROLE_CHANGE_EVENT, handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(ROLE_CHANGE_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

export function getRoleAssignments(): RoleAssignments {
  if (!isBrowser) return {}
  const raw = window.localStorage.getItem(ROLE_ASSIGNMENTS_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as RoleAssignments
    return parsed ?? {}
  } catch {
    return {}
  }
}

export function setRoleAssignments(assignments: RoleAssignments) {
  if (!isBrowser) return
  window.localStorage.setItem(ROLE_ASSIGNMENTS_KEY, JSON.stringify(assignments))
}
