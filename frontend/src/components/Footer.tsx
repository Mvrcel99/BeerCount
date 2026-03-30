import { NavLink } from 'react-router-dom'

export default function Footer() {
  const jahr = new Date().getFullYear()

  return (
    <footer className="app-footer">
      {/* Fußbereich mit Pflichtangaben */}
      <div className="container footer-inner">
        <span>© {jahr} BierLog – Prüfungsprojekt</span>
        <div className="footer-links">
          <NavLink to="/impressum">Impressum</NavLink>
          <NavLink to="/datenschutz">Datenschutz</NavLink>
        </div>
      </div>
    </footer>
  )
}
