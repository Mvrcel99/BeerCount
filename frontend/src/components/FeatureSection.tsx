export default function FeatureSection() {
  return (
    <section className="container" id="funktionen" aria-labelledby="features-title">
      {/* Funktionsübersicht */}
      <h2 className="section-title" id="features-title">
        Funktionsübersicht
      </h2>
      <p className="section-intro">
        Die Anwendung basiert auf einem ereignisorientierten Protokoll. Alle Änderungen
        werden als neue Einträge gespeichert und bleiben nachvollziehbar.
      </p>
      <div className="cards">
        <article className="card">
          <h3>Unveränderliches Ereignisprotokoll</h3>
          <p>Jede Änderung ist ein Eintrag. Der Verlauf bleibt konsistent und prüfbar.</p>
        </article>
        <article className="card">
          <h3>Zeitbasierte Auswertungen</h3>
          <p>Auswertungen nach Tag, Woche oder Monat zeigen den Verbrauch im Kontext.</p>
        </article>
        <article className="card">
          <h3>Korrekturen als Ereignisse</h3>
          <p>Fehler werden durch Korrektureinträge berichtigt, nicht durch Änderungen.</p>
        </article>
      </div>
    </section>
  )
}
