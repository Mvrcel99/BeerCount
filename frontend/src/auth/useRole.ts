import { useSyncExternalStore } from 'react'
import { resolveRole, subscribeToRoleChange, type UserRole } from './roles'

export function useRole(): UserRole {
  return useSyncExternalStore(subscribeToRoleChange, resolveRole, () => 'Student')
}
