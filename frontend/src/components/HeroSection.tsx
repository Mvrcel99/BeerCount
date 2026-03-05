export default function HeroSection() {
  return (
    <section className="container hero" aria-labelledby="hero-title">
      {/* Einführung der Anwendung */}
      <div>
        <h1 id="hero-title">Bier Counter für WWI24/A</h1>
        <p>
          Die Anwendung erfasst Bierereignisse als unveränderliche Einträge,
          berechnet laufende Salden und stellt den Verlauf nachvollziehbar dar.
        </p>
        <div className="hero-actions">
          <button className="button primary" type="button">
            Ereignis erfassen
          </button>
          <button className="button secondary" type="button">
            Protokoll einsehen
          </button>
        </div>
      </div>
      <div className="hero-panel" role="presentation">
        <h3>Aktuelle Ereignisse</h3>
        <ul className="hero-list">
          <li className="hero-list-item">
            <span>Störung gemeldet</span>
            <span>+2</span>
          </li>
          <li className="hero-list-item">
            <span>Bier bezahlt</span>
            <span>-1</span>
          </li>
          <li className="hero-list-item">
            <span>Nachlieferung Kühlschrank</span>
            <span>+6</span>
          </li>
        </ul>
        <div className="hero-balance">
          <span>Saldo</span>
          <span>7 Biere</span>
        </div>
      </div>
    </section>
  )
}
