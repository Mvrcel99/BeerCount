export type UserRole = 'Admin' | 'Kurssprecher' | 'Student'

export type RoleAssignments = Record<string, UserRole>

const ROLE_STORAGE_KEY = 'bierlog.role'
const ACCESS_KEY_STORAGE_KEY = 'bierlog.access.key'
const ROLE_ASSIGNMENTS_KEY = 'bierlog.role.assignments'
const ROLE_CHANGE_EVENT = 'bierlog-role-change'

const ACCESS_KEYS: Record<UserRole, string> = {
  Admin: 'ADMIN_KEY_123',
  Kurssprecher: 'KURS_KEY_123',
  Student: 'STUDENT_KEY_123',
}

export const ROLE_OPTIONS: UserRole[] = ['Admin', 'Kurssprecher', 'Student']
export const ADMIN_ACCESS_KEY = ACCESS_KEYS.Admin

const isBrowser = typeof window !== 'undefined'

export function resolveRoleFromAccessKey(key: string): UserRole | null {
  if (!key) return null
  const match = (Object.entries(ACCESS_KEYS) as Array<[UserRole, string]>).find(
    ([, value]) => value === key,
  )
  return match ? match[0] : null
}

export function resolveRole(): UserRole {
  if (!isBrowser) return 'Student'
  const storedKey = window.localStorage.getItem(ACCESS_KEY_STORAGE_KEY)
  if (storedKey) {
    const roleFromKey = resolveRoleFromAccessKey(storedKey)
    if (roleFromKey) return roleFromKey
  }
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

export function setAccessKey(key: string): UserRole | null {
  if (!isBrowser) return null
  const role = resolveRoleFromAccessKey(key)
  if (!role) return null
  window.localStorage.setItem(ACCESS_KEY_STORAGE_KEY, key)
  window.localStorage.setItem(ROLE_STORAGE_KEY, role)
  window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
  return role
}

export function clearAccessKey() {
  if (!isBrowser) return
  window.localStorage.removeItem(ACCESS_KEY_STORAGE_KEY)
  window.localStorage.removeItem(ROLE_STORAGE_KEY)
  window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
}

export function getStoredAccessKey(): string | null {
  if (!isBrowser) return null
  return window.localStorage.getItem(ACCESS_KEY_STORAGE_KEY)
}

export function getRequestAccessKey(): string | null {
  const stored = getStoredAccessKey()
  if (stored) return stored
  const envKey = import.meta.env.VITE_ACCESS_KEY
  if (envKey) return envKey
  return ACCESS_KEYS.Student
}

export function isAdminAccessKeyActive(): boolean {
  return getRequestAccessKey() === ADMIN_ACCESS_KEY
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
