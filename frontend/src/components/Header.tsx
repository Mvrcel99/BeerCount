import { MouseEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { setAdminAccess, useAdminAccess } from '../auth/adminAccess'

export default function Header() {
  const navigate = useNavigate()
  const hasAdminAccess = useAdminAccess()

  const handleAdminAccess = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (hasAdminAccess) {
      navigate('/admin')
      return
    }
    const input = window.prompt('Admin-Passwort eingeben')
    if (input === 'admin') {
      setAdminAccess(true)
      navigate('/admin')
    } else if (input !== null) {
      window.alert('Falsches Passwort.')
    }
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
            Meine Historie
          </NavLink>
          <button className="nav-link nav-button" type="button" onClick={handleAdminAccess}>
            Admin-Bereich
          </button>
        </nav>
        {hasAdminAccess ? (
          <div className="role-badge" aria-label="Adminzugang aktiv">
            Adminzugang aktiv
          </div>
        ) : null}
      </div>
    </header>
  )
}
