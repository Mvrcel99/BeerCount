import { events, students } from '../data/mockData'
import { formatiereDatum } from '../utils/berechnungen'

const studentNachId = new Map(students.map((student) => [student.id, student.name]))

export default function Events() {
  const sortierteEvents = [...events].sort(
    (a, b) => new Date(b.zeitstempel).getTime() - new Date(a.zeitstempel).getTime(),
  )

  return (
    <section className="page-section">
      <div className="container">
        <h1>Events</h1>
        <p className="section-intro">
          Die Liste zeigt alle Plus- und Minus-Events in chronologischer Reihenfolge.
        </p>
        <div className="event-list" role="list">
          {sortierteEvents.map((event) => {
            const name = studentNachId.get(event.studentId) ?? 'Unbekannt'
            const vorzeichen = event.typ === 'plus' ? '+' : '-'
            const typBezeichnung = event.typ === 'plus' ? 'Plus-Event' : 'Minus-Event'

            return (
              <article key={event.id} className="event-item" role="listitem">
                <div>
                  <div className="event-meta">{formatiereDatum(event.zeitstempel)}</div>
                  <h3 className="event-title">{name}</h3>
                  <p className="event-detail">{event.begruendung}</p>
                </div>
                <div className="event-values">
                  <span className="event-typ">{typBezeichnung}</span>
                  <span className="event-anzahl">
                    {vorzeichen}
                    {event.anzahl}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
