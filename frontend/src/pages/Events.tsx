import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { formatiereDatum } from '../utils/berechnungen'
import { DataService, type EventRecord, type Student } from '../services/DataService'
import { Refresh } from '../utils/refresh'
import { getInactiveStudents } from '../utils/inactiveStudents'

type DisplayEvent = {
  key: string
  event: EventRecord
  total: number
  count: number
}

export default function Events() {
  const location = useLocation()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const studentNachId = useMemo(
    () => new Map(students.map((student) => [student.studentId, student.name])),
    [students],
  )
  const inactiveStudents = useMemo(() => getInactiveStudents(), [students, events])

  useEffect(() => {
    let active = true
    const loadData = async (showLoading = true) => {
      if (!active) return
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const [eventData, studentData] = await Promise.all([
          DataService.getEvents(),
          DataService.getStudents(),
        ])
        if (!active) return
        setEvents(eventData ?? [])
        setStudents(studentData ?? [])
      } catch (loadError) {
        if (!active) return
        const message =
          loadError instanceof Error ? loadError.message : 'Backend nicht erreichbar'
        setError(message)
      } finally {
        if (active && showLoading) setIsLoading(false)
      }
    }

    loadData(true)

    const handleRefresh = () => loadData(false)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === Refresh.storageKey) {
        handleRefresh()
      }
    }

    window.addEventListener(Refresh.event, handleRefresh)
    window.addEventListener('storage', handleStorage)

    return () => {
      active = false
      window.removeEventListener(Refresh.event, handleRefresh)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    const toast = (location.state as { toast?: string } | null)?.toast
    if (!toast) return
    setSuccess(toast)
    const timer = window.setTimeout(() => setSuccess(null), 2400)
    return () => window.clearTimeout(timer)
  }, [location.state])

  const sortierteEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  const displayEvents = useMemo<DisplayEvent[]>(() => {
    const groups = new Map<string, DisplayEvent>()
    const matchesStudent = (event: EventRecord) => {
      if (!selectedStudentId) return true
      return event.studentId === selectedStudentId
    }
    const matchesRange = (event: EventRecord) => {
      if (!dateFrom && !dateTo) return true
      const time = new Date(event.timestamp).getTime()
      if (Number.isNaN(time)) return false
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`).getTime()
        if (time < from) return false
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59`).getTime()
        if (time > to) return false
      }
      return true
    }

    sortierteEvents.forEach((event, index) => {
      if (!matchesStudent(event) || !matchesRange(event)) {
        return
      }
      const isMinus = event.typ === 'minus'
      if (!isMinus) {
        const key = `single-${event.timestamp}-${event.studentId}-${index}`
        groups.set(key, { key, event, total: event.anzahl, count: 1 })
        return
      }
      const key = `${event.timestamp}|${event.studentId}|${event.begruendung}`
      const existing = groups.get(key)
      if (existing) {
        existing.total += event.anzahl
        existing.count += 1
      } else {
        groups.set(key, { key, event, total: event.anzahl, count: 1 })
      }
    })
    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime(),
    )
  }, [sortierteEvents, selectedStudentId, dateFrom, dateTo])

  return (
    <section className="page-section">
      <div className="container">
        <h1>Historie</h1>
        <p className="section-intro">
          Die Liste zeigt alle Plus- und Minus-Events in chronologischer Reihenfolge.
        </p>
        <div className="card filter-bar">
          <div className="form-field">
            <label htmlFor="filter-student">Verursacher</label>
            <select
              id="filter-student"
              className="select"
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
            >
              <option value="">Alle Studenten</option>
              {students.map((student) => (
                <option key={student.studentId} value={student.studentId}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="filter-from">Von</label>
            <input
              id="filter-from"
              className="input"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="filter-to">Bis</label>
            <input
              id="filter-to"
              className="input"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="visually-hidden" htmlFor="filter-reset">
              Filter zurücksetzen
            </label>
            <button
              id="filter-reset"
              className="button secondary"
              type="button"
              onClick={() => {
                setSelectedStudentId('')
                setDateFrom('')
                setDateTo('')
              }}
            >
              Reset
            </button>
          </div>
        </div>
        {success ? <div className="status-toast">{success}</div> : null}
        {error ? <div className="status-toast error">{error}</div> : null}
        {isLoading ? (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" /> Lädt Events…
          </div>
        ) : (
          <div className="event-list" role="list">
            {displayEvents.length === 0 ? (
              <div className="admin-helper">Keine Events für diesen Filter gefunden.</div>
            ) : null}
            {displayEvents.map((item) => {
              const { event, total, count, key } = item
              const inactiveName = inactiveStudents[event.studentId]
              const name =
                studentNachId.get(event.studentId) ??
                (inactiveName ? `${inactiveName} (ehem.)` : 'Unbekannt')
              const isCorrection =
                event.typ === 'correction' || event.typ === 'korrektur'
              const isMinus = event.typ === 'minus'
              const typBezeichnung = isCorrection
                ? 'Korrekturbuchung'
                : isMinus
                  ? 'Minus-Event'
                  : 'Plus-Event'
              const vorzeichen = total > 0 ? '+' : ''
              const detailSuffix =
                isMinus && count > 1 ? ` (${Math.abs(total)} Striche)` : ''

              return (
                <article
                  key={key}
                  className={`event-item${isMinus ? ' minus' : ''}`}
                  role="listitem"
                >
                  <div>
                    <div className="event-meta">{formatiereDatum(event.timestamp)}</div>
                    <h3 className="event-title">{name}</h3>
                    <p className="event-detail">
                      {event.begruendung}
                      {detailSuffix}
                    </p>
                    <p className="admin-helper">{event.vorlesung}</p>
                  </div>
                  <div className="event-values">
                    <span className="event-typ">{typBezeichnung}</span>
                    <span className="event-anzahl">
                      {vorzeichen}
                      {total}
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
