export default function Navigation() {
  return (
    <header>
      {/* Kopfbereich mit Navigation */}
      <div className="container navbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            BL
          </span>
          <span>BierLog</span>
        </div>
        <nav className="nav-links" aria-label="Hauptnavigation">
          <a href="#funktionen">Funktionsübersicht</a>
          <a href="#ablauf">So funktioniert es</a>
        </nav>
        <button className="button primary" type="button">
          Zur Anwendung
        </button>
      </div>
    </header>
  )
}
