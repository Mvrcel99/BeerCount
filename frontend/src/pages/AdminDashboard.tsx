import { useEffect, useMemo, useState } from 'react'
import UserCreationForm from '../components/admin/UserCreationForm'
import {
  DataService,
  type Balance,
  type EventRecord,
  type Student,
} from '../services/DataService'
import {
  ROLE_OPTIONS,
  getRoleAssignments,
  setRoleAssignments,
  type RoleAssignments,
  type UserRole,
  getRequestAccessKey,
  isAdminAccessKeyActive,
} from '../auth/roles'
import { useRole } from '../auth/useRole'
import { SeedService } from '../services/SeedService'
import { markStudentInactive } from '../utils/inactiveStudents'
import { Refresh } from '../utils/refresh'

type EditDraft = {
  studentId: string
  vorlesung: string
  typ: 'plus' | 'minus'
  anzahl: string
  begruendung: string
  correctionReason: string
}

const MINUS_VORLESUNG = 'Bier-Ausgabe'

const buildEventKey = (event: EventRecord) =>
  `${event.timestamp}-${event.studentId}-${event.vorlesung}-${event.anzahl}-${event.begruendung}`

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)
  const [seedError, setSeedError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [editTarget, setEditTarget] = useState<EventRecord | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [neutralizedKeys, setNeutralizedKeys] = useState<Set<string>>(new Set())
  const [studentDeleteTarget, setStudentDeleteTarget] = useState<Student | null>(null)
  const [isDeletingStudent, setIsDeletingStudent] = useState(false)
  const role = useRole()
  const [roleAssignments, setRoleAssignmentsState] = useState<RoleAssignments>(() =>
    getRoleAssignments(),
  )

  const studentById = useMemo(
    () => new Map(students.map((student) => [student.studentId, student])),
    [students],
  )

  const sortedBalances = useMemo(() => {
    return [...balances].sort((a, b) => {
      if (b.striche !== a.striche) return b.striche - a.striche
      return a.name.localeCompare(b.name, 'de')
    })
  }, [balances])

  const totalBalance = balances.reduce((sum, item) => sum + (item.striche || 0), 0)

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)
    try {
      const [eventsData, studentsData, balancesData] = await Promise.all([
        DataService.getEvents(),
        DataService.getStudents(),
        DataService.getBalances(),
      ])
      setEvents(eventsData ?? [])
      setStudents(studentsData ?? [])
      setBalances(balancesData ?? [])
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unbekannter Fehler'
      console.log('Admin-Daten laden fehlgeschlagen', loadError)
      setError(message)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true
    const run = async () => {
      if (!isActive) return
      await loadData()
    }
    run()
    return () => {
      isActive = false
    }
  }, [])

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const closeDeleteModal = () => {
    setDeleteTarget(null)
    setDeleteReason('')
  }

  const closeEditModal = () => {
    setEditTarget(null)
    setEditDraft(null)
  }

  const parseAmount = (value: string) => {
    const parsed = Math.trunc(Number(value))
    if (!Number.isFinite(parsed) || parsed < 1) return null
    return parsed
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const reason = deleteReason.trim()
    if (!reason) {
      const message = 'Bitte eine Begründung der Löschung angeben.'
      setError(message)
      console.log(message)
      return
    }
    if (!isAdminAccessKeyActive()) {
      const message = 'Aktion erfordert ADMIN_KEY_123 im Access Key.'
      setError(message)
      console.log(message)
      return
    }

    setBusyKey('delete')
    setError(null)
    try {
      await DataService.createCorrection({
        studentId: deleteTarget.studentId,
        begruendung: reason,
        anzahl: -deleteTarget.anzahl,
      })
      setNeutralizedKeys((prev) => {
        const next = new Set(prev)
        next.add(buildEventKey(deleteTarget))
        return next
      })
      closeDeleteModal()
      await loadData(false)
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : 'Unbekannter Fehler'
      console.log('Löschung fehlgeschlagen', actionError)
      setError(message)
    } finally {
      setBusyKey(null)
    }
  }

  const openEditModal = (event: EventRecord) => {
    const initial: EditDraft = {
      studentId: event.studentId,
      vorlesung: event.typ === 'minus' ? MINUS_VORLESUNG : event.vorlesung,
      typ: event.typ === 'minus' ? 'minus' : 'plus',
      anzahl: String(Math.abs(event.anzahl)),
      begruendung: event.begruendung,
      correctionReason: '',
    }
    setEditTarget(event)
    setEditDraft(initial)
  }

  const handleEditConfirm = async () => {
    if (!editTarget || !editDraft) return
    const amount = parseAmount(editDraft.anzahl)
    if (!amount) {
      const message = 'Bitte eine gültige Anzahl angeben.'
      setError(message)
      console.log(message)
      return
    }
    if (!editDraft.begruendung.trim()) {
      const message = 'Bitte eine Begründung für das neue Event angeben.'
      setError(message)
      console.log(message)
      return
    }
    if (editDraft.typ === 'plus' && !editDraft.vorlesung.trim()) {
      const message = 'Bitte eine Vorlesung angeben.'
      setError(message)
      console.log(message)
      return
    }
    if (!editDraft.correctionReason.trim()) {
      const message = 'Bitte eine Begründung der Korrektur angeben.'
      setError(message)
      console.log(message)
      return
    }
    if (!isAdminAccessKeyActive()) {
      const message = 'Aktion erfordert ADMIN_KEY_123 im Access Key.'
      setError(message)
      console.log(message)
      return
    }

    setBusyKey('edit')
    setError(null)
    try {
      await DataService.createCorrection({
        studentId: editTarget.studentId,
        begruendung: editDraft.correctionReason.trim(),
        anzahl: -editTarget.anzahl,
      })

      if (editDraft.typ === 'minus') {
        for (let i = 0; i < amount; i += 1) {
          await DataService.createMinus({
            studentId: editDraft.studentId,
            begruendung: editDraft.begruendung.trim(),
          })
        }
      } else {
        for (let i = 0; i < amount; i += 1) {
          await DataService.createEvent({
            studentId: editDraft.studentId,
            vorlesung: editDraft.vorlesung.trim(),
            begruendung: editDraft.begruendung.trim(),
            typ: 'plus',
          })
        }
      }

      setNeutralizedKeys((prev) => {
        const next = new Set(prev)
        next.add(buildEventKey(editTarget))
        return next
      })
      closeEditModal()
      await loadData(false)
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : 'Unbekannter Fehler'
      console.log('Bearbeitung fehlgeschlagen', actionError)
      setError(message)
    } finally {
      setBusyKey(null)
    }
  }

  const accessKeyHint = getRequestAccessKey()
    ? null
    : 'Hinweis: Access Key ist nicht gesetzt. Admin-Endpunkte sind geschützt.'

  const handleRoleChange = (studentId: string, role: UserRole) => {
    const nextAssignments: RoleAssignments = {
      ...roleAssignments,
      [studentId]: role,
    }
    setRoleAssignmentsState(nextAssignments)
    setRoleAssignments(nextAssignments)
  }

  const handleSeed = async () => {
    if (!isAdminAccessKeyActive()) {
      const message = 'Beispieldaten erfordern ADMIN_KEY_123 im Access Key.'
      setSeedError(message)
      console.log(message)
      return
    }
    setSeedError(null)
    setSeedMessage(null)
    setIsSeeding(true)
    try {
      await SeedService.seedSampleData()
      setSeedMessage('Beispieldaten erfolgreich in InfluxDB geladen.')
      await loadData(false)
    } catch (seedErr) {
      const message = seedErr instanceof Error ? seedErr.message : 'Seed fehlgeschlagen'
      console.log('Seed fehlgeschlagen', seedErr)
      setSeedError(message)
    } finally {
      setIsSeeding(false)
    }
  }

  const closeStudentDeleteModal = () => {
    setStudentDeleteTarget(null)
  }

  const handleStudentDelete = async () => {
    if (!studentDeleteTarget) return
    if (!isAdminAccessKeyActive()) {
      const message = 'Aktion erfordert ADMIN_KEY_123 im Access Key.'
      setError(message)
      console.log(message)
      return
    }

    setIsDeletingStudent(true)
    setError(null)
    try {
      await DataService.deleteStudent(studentDeleteTarget.studentId)
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'Löschen fehlgeschlagen'
      console.log('Student löschen fehlgeschlagen', deleteError)
      setError(`${message}. Nutzer wird lokal deaktiviert.`)
    } finally {
      markStudentInactive(studentDeleteTarget.studentId, studentDeleteTarget.name)
      setStudents((prev) =>
        prev.filter((student) => student.studentId !== studentDeleteTarget.studentId),
      )
      setBalances((prev) =>
        prev.filter((balance) => balance.studentId !== studentDeleteTarget.studentId),
      )
      setRoleAssignmentsState((prev) => {
        const next = { ...prev }
        delete next[studentDeleteTarget.studentId]
        setRoleAssignments(next)
        return next
      })
      closeStudentDeleteModal()
      Refresh.trigger()
      setIsDeletingStudent(false)
    }
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
        {seedMessage ? <div className="status-toast">{seedMessage}</div> : null}
        {seedError ? <div className="status-toast error">{seedError}</div> : null}
        {isLoading ? (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" /> Lädt Admin-Daten…
          </div>
        ) : null}
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-title">Admin</div>
            <nav className="admin-nav">
              <a href="#admin-overview">Systemübersicht</a>
              <a href="#admin-users">User-Verwaltung</a>
              <a href="#admin-roles">Rollen</a>
              <a href="#admin-events">Events</a>
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
              {role === 'Admin' ? (
                <div className="admin-seed">
                  <div className="admin-warning">
                    Achtung: Das Seed lädt unveränderliche Events. Mehrfaches Ausführen
                    erzeugt Duplikate.
                  </div>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={handleSeed}
                    disabled={isSeeding}
                  >
                    {isSeeding ? 'Beispieldaten werden geladen…' : 'System mit Beispieldaten füllen'}
                  </button>
                </div>
              ) : null}
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
                      <th scope="col">Rang</th>
                      <th scope="col">Name</th>
                      <th scope="col">Kurs</th>
                      <th scope="col">Striche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBalances.map((balance, index) => {
                      const rank = index + 1
                      const rowClass = rank <= 3 ? `leaderboard top-${rank}` : 'leaderboard'
                      return (
                        <tr key={balance.studentId} className={rowClass}>
                          <td>{rank === 1 ? '👑 1' : rank}</td>
                          <td>{balance.name}</td>
                          <td>{balance.kurs ?? '—'}</td>
                          <td>{balance.striche}</td>
                        </tr>
                      )
                    })}
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
                  await loadData(false)
                }}
              />
              <div className="card admin-table">
                <h3>Studierendenliste</h3>
                {students.length === 0 ? (
                  <div className="admin-helper">Keine aktiven Studenten vorhanden.</div>
                ) : (
                  <table className="data-table" aria-label="Studenten löschen">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Student-ID</th>
                        <th scope="col">Kurs</th>
                        <th scope="col">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.studentId}>
                          <td>{student.name}</td>
                          <td>{student.studentId}</td>
                          <td>{student.kurs ?? '—'}</td>
                          <td>
                            <button
                              className="button danger"
                              type="button"
                              onClick={() => setStudentDeleteTarget(student)}
                              disabled={isDeletingStudent}
                            >
                              Löschen
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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

            {role === 'Admin' ? (
              <section id="admin-events" className="admin-section">
                <div className="admin-section-header">
                  <h2 className="section-title">Events</h2>
                  <span className="admin-helper">
                    Bearbeiten und Löschen erzeugen Korrektur-Events.
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
                        <th scope="col">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.map((event) => {
                        const student = studentById.get(event.studentId)
                        const eventKey = buildEventKey(event)
                        const isCorrection =
                          event.typ === 'correction' || event.typ === 'korrektur'
                        const typLabel = isCorrection
                          ? 'Korrekturbuchung'
                          : event.typ === 'minus'
                            ? 'Minus-Event'
                            : 'Plus-Event'
                        const isNeutralized = neutralizedKeys.has(eventKey)
                        return (
                          <tr
                            key={eventKey}
                            className={isNeutralized ? 'event-row neutralized' : undefined}
                          >
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
                              <div className="inline-actions">
                                <button
                                  className="button secondary"
                                  type="button"
                                  disabled={isCorrection || isNeutralized || busyKey !== null}
                                  onClick={() => openEditModal(event)}
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  className="button danger"
                                  type="button"
                                  disabled={isCorrection || isNeutralized || busyKey !== null}
                                  onClick={() => {
                                    setDeleteTarget(event)
                                    setDeleteReason('')
                                  }}
                                >
                                  Löschen
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
      {deleteTarget ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Event löschen">
            <div className="modal-header">
              <h3>Event löschen</h3>
              <button className="button secondary" type="button" onClick={closeDeleteModal}>
                Schließen
              </button>
            </div>
            <div className="modal-body">
              <p className="admin-helper">
                Die Löschung erzeugt eine Korrekturbuchung mit entgegengesetztem Wert.
              </p>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="delete-reason">Begründung der Löschung</label>
                  <textarea
                    id="delete-reason"
                    className="textarea"
                    value={deleteReason}
                    onChange={(event) => setDeleteReason(event.target.value)}
                    placeholder="z.B. Event wurde doppelt erfasst"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={closeDeleteModal}
                disabled={busyKey === 'delete'}
              >
                Abbrechen
              </button>
              <button
                className="button danger"
                type="button"
                onClick={handleDeleteConfirm}
                disabled={busyKey === 'delete' || !deleteReason.trim()}
              >
                {busyKey === 'delete' ? 'Lösche…' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {editTarget && editDraft ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Event bearbeiten">
            <div className="modal-header">
              <h3>Event bearbeiten</h3>
              <button className="button secondary" type="button" onClick={closeEditModal}>
                Schließen
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="edit-student">Student</label>
                  <select
                    id="edit-student"
                    className="select"
                    value={editDraft.studentId}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, studentId: event.target.value } : prev,
                      )
                    }
                  >
                    {students.map((student) => (
                      <option key={student.studentId} value={student.studentId}>
                        {student.name} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="edit-type">Typ</label>
                  <select
                    id="edit-type"
                    className="select"
                    value={editDraft.typ}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              typ: event.target.value as 'plus' | 'minus',
                              vorlesung:
                                event.target.value === 'minus'
                                  ? MINUS_VORLESUNG
                                  : prev.vorlesung,
                            }
                          : prev,
                      )
                    }
                  >
                    <option value="plus">Plus-Event</option>
                    <option value="minus">Minus-Event</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="edit-lecture">Vorlesung</label>
                  <input
                    id="edit-lecture"
                    className="input"
                    type="text"
                    value={editDraft.typ === 'minus' ? MINUS_VORLESUNG : editDraft.vorlesung}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, vorlesung: event.target.value } : prev,
                      )
                    }
                    disabled={editDraft.typ === 'minus'}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-amount">Anzahl</label>
                  <input
                    id="edit-amount"
                    className="input"
                    type="number"
                    min={1}
                    step={1}
                    value={editDraft.anzahl}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, anzahl: event.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-reason">Begründung (neues Event)</label>
                  <textarea
                    id="edit-reason"
                    className="textarea"
                    value={editDraft.begruendung}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, begruendung: event.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-correction">Begründung der Korrektur</label>
                  <textarea
                    id="edit-correction"
                    className="textarea"
                    value={editDraft.correctionReason}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, correctionReason: event.target.value } : prev,
                      )
                    }
                    placeholder="z.B. falscher Student"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={closeEditModal}
                disabled={busyKey === 'edit'}
              >
                Abbrechen
              </button>
              <button
                className="button primary"
                type="button"
                onClick={handleEditConfirm}
                disabled={busyKey === 'edit'}
              >
                {busyKey === 'edit' ? 'Speichere…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {studentDeleteTarget ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Student löschen">
            <div className="modal-header">
              <h3>Student löschen</h3>
              <button
                className="button secondary"
                type="button"
                onClick={closeStudentDeleteModal}
              >
                Schließen
              </button>
            </div>
            <div className="modal-body">
              <p className="admin-helper">
                Möchtest du {studentDeleteTarget.name} wirklich löschen? Alle bisherigen
                Events bleiben in der Historie gespeichert, aber der Nutzer taucht nicht
                mehr in den Listen auf.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={closeStudentDeleteModal}
                disabled={isDeletingStudent}
              >
                Abbrechen
              </button>
              <button
                className="button danger"
                type="button"
                onClick={handleStudentDelete}
                disabled={isDeletingStudent}
              >
                {isDeletingStudent ? 'Lösche…' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
