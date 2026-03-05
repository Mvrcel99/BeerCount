import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="app-header">
      {/* Kopfbereich mit Navigation */}
      <div className="container navbar">
        <nav className="nav-links" aria-label="Hauptnavigation">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/events">
            Events
          </NavLink>
        </nav>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            BL
          </span>
          <span>BierLog</span>
        </div>
      </div>
    </header>
  )
}
