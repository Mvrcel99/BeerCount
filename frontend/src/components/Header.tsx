import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  clearAccessKey,
  resolveRoleFromAccessKey,
  setAccessKey,
} from '../auth/roles'
import { useRole } from '../auth/useRole'

export default function Header() {
  const role = useRole()
  const [isAccessOpen, setIsAccessOpen] = useState(false)
  const [accessKeyInput, setAccessKeyInput] = useState('')
  const [accessMessage, setAccessMessage] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessMessage) return
    const timer = window.setTimeout(() => setAccessMessage(null), 2500)
    return () => window.clearTimeout(timer)
  }, [accessMessage])

  const handleAccessSubmit = () => {
    setAccessError(null)
    const trimmed = accessKeyInput.trim()
    if (!trimmed) {
      setAccessError('Bitte einen Access Key eingeben.')
      return
    }
    const roleFromKey = resolveRoleFromAccessKey(trimmed)
    if (!roleFromKey) {
      setAccessError('Ungültiger Access Key.')
      return
    }
    setAccessKey(trimmed)
    setAccessMessage(`${roleFromKey} freigeschaltet`)
    setAccessKeyInput('')
    setIsAccessOpen(false)
  }

  const handleReset = () => {
    clearAccessKey()
    setAccessMessage('Student-Modus aktiv')
    setAccessError(null)
    setAccessKeyInput('')
    setIsAccessOpen(false)
  }

  return (
    <header className="app-header">
      {/* Kopfbereich mit Navigation */}
      <div className="container navbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            BL
          </span>
          <span>BierLog</span>
        </div>
        <nav className="nav-links" aria-label="Hauptnavigation">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/events">
            Historie
          </NavLink>
          {role === 'Admin' ? (
            <NavLink
              className={({ isActive }) =>
                `nav-link admin-link${isActive ? ' active' : ''}`
              }
              to="/admin"
            >
              Admin Dashboard
            </NavLink>
          ) : null}
        </nav>
        <div className="role-cluster">
          <div className="access-menu">
            <button
              className="nav-link nav-button"
              type="button"
              onClick={() => setIsAccessOpen((open) => !open)}
            >
              🔑 Access
            </button>
            {isAccessOpen ? (
              <div className="access-panel" role="dialog" aria-label="Access Key eingeben">
                <label className="access-label" htmlFor="access-key-input">
                  Access Key
                </label>
                <input
                  id="access-key-input"
                  className="input"
                  type="password"
                  value={accessKeyInput}
                  onChange={(event) => setAccessKeyInput(event.target.value)}
                  placeholder="z.B. ADMIN_KEY_123"
                />
                {accessError ? <div className="admin-warning">{accessError}</div> : null}
                <div className="inline-actions">
                  <button className="button primary" type="button" onClick={handleAccessSubmit}>
                    Aktivieren
                  </button>
                  <button className="button secondary" type="button" onClick={handleReset}>
                    Student-Modus
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="role-badge" aria-label={`Rolle: ${role}`}>
            Rolle: {role}
          </div>
        </div>
      </div>
      {accessMessage ? <div className="access-toast">{accessMessage}</div> : null}
    </header>
  )
}
