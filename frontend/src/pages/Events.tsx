import { useEffect, useMemo, useState } from 'react'
import { formatiereDatum } from '../utils/berechnungen'
import { DataService, type EventRecord, type Student } from '../services/DataService'

export default function Events() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const studentNachId = useMemo(
    () => new Map(students.map((student) => [student.studentId, student.name])),
    [students],
  )

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    Promise.all([DataService.getEvents(), DataService.getStudents()])
      .then(([eventData, studentData]) => {
        if (!active) return
        setEvents(eventData ?? [])
        setStudents(studentData ?? [])
      })
      .catch((loadError) => {
        if (!active) return
        const message =
          loadError instanceof Error ? loadError.message : 'Backend nicht erreichbar'
        setError(message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const sortierteEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <section className="page-section">
      <div className="container">
        <h1>Historie</h1>
        <p className="section-intro">
          Die Liste zeigt alle Plus- und Minus-Events in chronologischer Reihenfolge.
        </p>
        {error ? <div className="status-toast error">{error}</div> : null}
        {isLoading ? (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" /> Lädt Events…
          </div>
        ) : (
          <div className="event-list" role="list">
            {sortierteEvents.map((event, index) => {
              const name = studentNachId.get(event.studentId) ?? 'Unbekannt'
              const isCorrection =
                event.typ === 'correction' || event.typ === 'korrektur'
              const typBezeichnung = isCorrection
                ? 'Korrekturbuchung'
                : event.typ === 'minus'
                  ? 'Minus-Event'
                  : 'Plus-Event'
              const vorzeichen = event.anzahl > 0 ? '+' : ''

              return (
                <article
                  key={`${event.timestamp}-${event.studentId}-${index}`}
                  className="event-item"
                  role="listitem"
                >
                  <div>
                    <div className="event-meta">{formatiereDatum(event.timestamp)}</div>
                    <h3 className="event-title">{name}</h3>
                    <p className="event-detail">{event.begruendung}</p>
                    <p className="admin-helper">{event.vorlesung}</p>
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
        )}
      </div>
    </section>
  )
}
