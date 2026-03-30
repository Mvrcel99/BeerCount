export default function Datenschutz() {
  return (
    <section className="page-section">
      <div className="container">
        <h1>Datenschutzerklärung</h1>
        <p className="section-intro">
          Diese Erklärung beschreibt die Verarbeitung von Daten innerhalb des
          Prüfungsprojekts.
        </p>
        <div className="card text-block">
          <h2>Zweck der Anwendung</h2>
          <p>Die Anwendung dokumentiert Ereignisse zur Verwaltung von Bierstrichen.</p>
          <h2>Verarbeitete Daten</h2>
          <p>
            Verarbeitet werden Namen der Teilnehmer, Ereignistypen, Mengen sowie
            Zeitstempel der Einträge. Es handelt sich um Projektannahmen.
          </p>
          <h2>Speicherdauer</h2>
          <p>Die Daten werden für die Dauer des Projektzeitraums gespeichert.</p>
          <h2>Rechte der Betroffenen</h2>
          <ul className="bullet-list">
            <li>Auskunft über gespeicherte Daten</li>
            <li>Berichtigung unrichtiger Angaben</li>
            <li>Löschung nach Projektende</li>
          </ul>
          <p>Hinweis: Dies ist ein Prüfungsprojekt.</p>
        </div>
      </div>
    </section>
  )
}
