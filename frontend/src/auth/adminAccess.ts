import { useSyncExternalStore } from 'react'

const ADMIN_ACCESS_KEY = 'bierlog.admin.access'
const ADMIN_ACCESS_EVENT = 'bierlog-admin-access-change'

const isBrowser = typeof window !== 'undefined'

export function getAdminAccess(): boolean {
  if (!isBrowser) return false
  return window.sessionStorage.getItem(ADMIN_ACCESS_KEY) === 'true'
}

export function setAdminAccess(value: boolean) {
  if (!isBrowser) return
  window.sessionStorage.setItem(ADMIN_ACCESS_KEY, value ? 'true' : 'false')
  window.dispatchEvent(new Event(ADMIN_ACCESS_EVENT))
}

export function subscribeToAdminAccess(callback: () => void) {
  if (!isBrowser) return () => undefined
  const handler = () => callback()
  const storageHandler = (event: StorageEvent) => {
    if (event.key === ADMIN_ACCESS_KEY) {
      callback()
    }
  }
  window.addEventListener(ADMIN_ACCESS_EVENT, handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(ADMIN_ACCESS_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

export function useAdminAccess(): boolean {
  return useSyncExternalStore(subscribeToAdminAccess, getAdminAccess, () => false)
}
