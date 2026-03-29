import { useEffect, useMemo, useState } from 'react'
import UserCreationForm from '../components/admin/UserCreationForm'
import { CorrectionService, type EventRecord } from '../services/CorrectionService'
import {
  ROLE_OPTIONS,
  getRoleAssignments,
  setRoleAssignments,
  type RoleAssignments,
  type UserRole,
} from '../auth/roles'

type Student = {
  studentId: string
  name: string
  kurs?: string
}

type Balance = {
  studentId: string
  name: string
  kurs?: string
  striche: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY ?? ''

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [roleAssignments, setRoleAssignmentsState] = useState<RoleAssignments>(() =>
    getRoleAssignments(),
  )

  const studentById = useMemo(
    () => new Map(students.map((student) => [student.studentId, student])),
    [students],
  )

  const totalBalance = balances.reduce((sum, item) => sum + (item.striche || 0), 0)

  useEffect(() => {
    let isActive = true

    const fetchJson = async <T,>(path: string): Promise<T> => {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          ...(ACCESS_KEY ? { 'x-access-key': ACCESS_KEY } : {}),
        },
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Request failed with status ${response.status}`)
      }
      return response.json() as Promise<T>
    }

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [eventsData, studentsData, balancesData] = await Promise.all([
          CorrectionService.listEvents(),
          fetchJson<Student[]>('/students'),
          fetchJson<Balance[]>('/students/balance'),
        ])

        if (!isActive) return
        setEvents(eventsData ?? [])
        setStudents(studentsData ?? [])
        setBalances(balancesData ?? [])
      } catch (loadError) {
        if (!isActive) return
        const message =
          loadError instanceof Error ? loadError.message : 'Unbekannter Fehler'
        setError(message)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const handleNeutralize = async (event: EventRecord, eventKey: string) => {
    const reason = reasons[eventKey]?.trim()
    if (!reason) return

    setBusyKey(eventKey)
    setError(null)
    try {
      await CorrectionService.createCorrection({
        studentId: event.studentId,
        begruendung: reason,
        anzahl: -event.anzahl,
      })

      setReasons((prev) => ({ ...prev, [eventKey]: '' }))
      const refreshed = await CorrectionService.listEvents()
      setEvents(refreshed ?? [])
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : 'Unbekannter Fehler'
      setError(message)
    } finally {
      setBusyKey(null)
    }
  }

  const accessKeyHint = ACCESS_KEY
    ? null
    : 'Hinweis: VITE_ACCESS_KEY ist nicht gesetzt. Admin-Endpunkte sind geschützt.'

  const handleRoleChange = (studentId: string, role: UserRole) => {
    const nextAssignments: RoleAssignments = {
      ...roleAssignments,
      [studentId]: role,
    }
    setRoleAssignmentsState(nextAssignments)
    setRoleAssignments(nextAssignments)
  }

  return (
    <section className="page-section admin-shell">
      <div className="container">
        <h1>
          Admin Control Panel <span className="admin-tag">Administrativ</span>
        </h1>
        <p className="section-intro">
          Technische und organisatorische Steuerung mit lückenloser Historie.
        </p>
        {accessKeyHint ? <div className="admin-warning">{accessKeyHint}</div> : null}
        {error ? <div className="admin-warning">{error}</div> : null}
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-title">Admin</div>
            <nav className="admin-nav">
              <a href="#admin-overview">Systemübersicht</a>
              <a href="#admin-users">User-Verwaltung</a>
              <a href="#admin-roles">Rollen</a>
              <a href="#admin-corrections">Korrekturen</a>
              <a href="#admin-log">Systemlog</a>
            </nav>
            <div className="admin-helper">
              {isLoading ? 'Daten werden geladen…' : `${students.length} Nutzer`}
            </div>
          </aside>

          <div className="admin-main">
            <section id="admin-overview" className="admin-section">
              <div className="admin-section-header">
                <h2 className="section-title">Systemübersicht</h2>
                <span className="admin-helper">
                  Gesamtbilanz: {totalBalance} Striche
                </span>
              </div>
              <div className="cards">
                <div className="card">
                  <h3>Events gesamt</h3>
                  <p>{events.length}</p>
                </div>
                <div className="card">
                  <h3>Teilnehmer</h3>
                  <p>{students.length}</p>
                </div>
                <div className="card">
                  <h3>Korrekturbuchungen</h3>
                  <p>
                    {
                      events.filter(
                        (event) =>
                          event.typ === 'correction' || event.typ === 'korrektur',
                      ).length
                    }
                  </p>
                </div>
              </div>
              <div className="card">
                <h3>Kontostände</h3>
                <table className="data-table" aria-label="Kontostände">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Kurs</th>
                      <th scope="col">Striche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((balance) => (
                      <tr key={balance.studentId}>
                        <td>{balance.name}</td>
                        <td>{balance.kurs ?? '—'}</td>
                        <td>{balance.striche}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="admin-users" className="admin-section">
              <div className="admin-section-header">
                <h2 className="section-title">User-Verwaltung</h2>
                <span className="admin-helper">
                  Neue Studenten werden als eigener Datensatz angelegt.
                </span>
              </div>
              <UserCreationForm
                onCreated={async () => {
                  const response = await fetch(`${API_BASE_URL}/students`, {
                    headers: {
                      ...(ACCESS_KEY ? { 'x-access-key': ACCESS_KEY } : {}),
                    },
                  })
                  if (response.ok) {
                    const data = (await response.json()) as Student[]
                    setStudents(data)
                  }
                }}
              />
            </section>

            <section id="admin-roles" className="admin-section">
              <div className="admin-section-header">
                <h2 className="section-title">Rollen & Rechte</h2>
                <span className="admin-helper">
                  Rollenverwaltung wird lokal gespeichert, Backend-Schnittstelle fehlt.
                </span>
              </div>
              <div className="card">
                <table className="data-table" aria-label="Rollen zuweisen">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Student-ID</th>
                      <th scope="col">Rolle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const role = roleAssignments[student.studentId] ?? 'Student'
                      return (
                        <tr key={student.studentId}>
                          <td>{student.name}</td>
                          <td>{student.studentId}</td>
                          <td>
                            <select
                              className="select"
                              value={role}
                              onChange={(event) =>
                                handleRoleChange(student.studentId, event.target.value as UserRole)
                              }
                            >
                              {ROLE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="admin-corrections" className="admin-section">
              <div className="admin-section-header">
                <h2 className="section-title">Korrekturen</h2>
                <span className="admin-helper">
                  Jede Korrektur erzeugt eine Korrekturbuchung.
                </span>
              </div>
              <div className="card admin-table">
                <table className="data-table" aria-label="Alle Events">
                  <thead>
                    <tr>
                      <th scope="col">Zeit</th>
                      <th scope="col">Student</th>
                      <th scope="col">Vorlesung</th>
                      <th scope="col">Typ</th>
                      <th scope="col">Anzahl</th>
                      <th scope="col">Begründung</th>
                      <th scope="col">Korrektur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEvents.map((event, index) => {
                      const student = studentById.get(event.studentId)
                      const eventKey = `${event.timestamp}-${event.studentId}-${index}`
                      const isCorrection =
                        event.typ === 'correction' || event.typ === 'korrektur'
                      const typLabel = isCorrection
                        ? 'Korrekturbuchung'
                        : event.typ === 'minus'
                          ? 'Minus-Event'
                          : 'Plus-Event'

                      return (
                        <tr key={eventKey}>
                          <td>{event.timestamp}</td>
                          <td>{student?.name ?? event.studentId}</td>
                          <td>{event.vorlesung}</td>
                          <td>
                            <span
                              className={[
                                'event-tag',
                                isCorrection
                                  ? 'correction'
                                  : event.typ === 'minus'
                                    ? 'minus'
                                    : 'plus',
                              ].join(' ')}
                            >
                              {typLabel}
                            </span>
                          </td>
                          <td>{event.anzahl}</td>
                          <td>{event.begruendung}</td>
                          <td>
                            {isCorrection ? (
                              <span className="admin-helper">—</span>
                            ) : (
                              <div className="form-inline">
                                <label htmlFor={`reason-${eventKey}`}>Begründung</label>
                                <input
                                  id={`reason-${eventKey}`}
                                  className="input"
                                  type="text"
                                  value={reasons[eventKey] ?? ''}
                                  onChange={(inputEvent) =>
                                    setReasons((prev) => ({
                                      ...prev,
                                      [eventKey]: inputEvent.target.value,
                                    }))
                                  }
                                  placeholder="z.B. falsch erfasst"
                                  required
                                />
                                <button
                                  className="button secondary"
                                  type="button"
                                  disabled={
                                    busyKey === eventKey || !reasons[eventKey]?.trim()
                                  }
                                  onClick={() => handleNeutralize(event, eventKey)}
                                >
                                  {busyKey === eventKey
                                    ? 'Korrigiert…'
                                    : 'Korrektur'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="admin-log" className="admin-section">
              <div className="admin-section-header">
                <h2 className="section-title">Systemlog</h2>
                <span className="admin-helper">Alle Aktivitäten in Echtzeit.</span>
              </div>
              <div className="event-list">
                {sortedEvents.slice(0, 15).map((event, index) => {
                  const student = studentById.get(event.studentId)
                  const logKey = `${event.timestamp}-${event.studentId}-log-${index}`
                  const isCorrection =
                    event.typ === 'correction' || event.typ === 'korrektur'
                  const typLabel = isCorrection
                    ? 'Korrekturbuchung'
                    : event.typ === 'minus'
                      ? 'Minus-Event'
                      : 'Plus-Event'
                  return (
                    <article key={logKey} className="event-item">
                      <div>
                        <div className="event-meta">{event.timestamp}</div>
                        <h3 className="event-title">{student?.name ?? event.studentId}</h3>
                        <p className="event-detail">{event.begruendung}</p>
                      </div>
                      <div className="event-values">
                        <span className="event-typ">{typLabel}</span>
                        <span className="event-anzahl">{event.anzahl}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
