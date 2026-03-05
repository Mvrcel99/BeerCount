export default function ProcessSection() {
  return (
    <section className="container" id="ablauf" aria-labelledby="process-title">
      {/* Ablaufbeschreibung */}
      <h2 className="section-title" id="process-title">
        So funktioniert es
      </h2>
      <p className="section-intro">
        Der Ablauf ist bewusst linear gehalten, damit der Saldo jederzeit konsistent
        bleibt und die Ursache jeder Änderung erkennbar ist.
      </p>
      <div className="steps">
        <div className="step">
          <div className="step-number">1</div>
          <div>
            <h3>Ereignis erfassen</h3>
            <p>Jede Entnahme oder Lieferung wird sofort als Ereignis gespeichert.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <div>
            <h3>Ausgleichsbuchungen erfassen</h3>
            <p>Zahlungen oder Rückgaben werden als separate Einträge dokumentiert.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <div>
            <h3>Verlauf auswerten</h3>
            <p>Der Verlauf steht als Zeitreihe zur Verfügung und kann gefiltert werden.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
