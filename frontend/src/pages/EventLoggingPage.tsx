import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../auth/useRole'
import { DataService, type Student } from '../services/DataService'
import { Refresh } from '../utils/refresh'
import { formatUmlauts } from '../utils/umlaute'

type EventMode = 'plus' | 'minus'

const MINUS_VORLESUNG = 'Bier-Ausgabe'
const LECTURE_STORAGE_KEY = 'bierlog.lectures'
const CUSTOM_LECTURE_VALUE = '__custom__'
const DEFAULT_LECTURES = ['Web-Engineering', 'Datenbanken', 'Mathe']
const isBrowser = typeof window !== 'undefined'

const loadLectures = () => {
  if (!isBrowser) return DEFAULT_LECTURES
  const raw = window.localStorage.getItem(LECTURE_STORAGE_KEY)
  if (!raw) return DEFAULT_LECTURES
  try {
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LECTURES
  } catch {
    return DEFAULT_LECTURES
  }
}

const storeLectures = (lectures: string[]) => {
  if (!isBrowser) return
  window.localStorage.setItem(LECTURE_STORAGE_KEY, JSON.stringify(lectures))
}

export default function EventLoggingPage() {
  const role = useRole()
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [eventType, setEventType] = useState<EventMode>('plus')
  const [lectureOptions, setLectureOptions] = useState<string[]>(() => loadLectures())
  const [lectureSelection, setLectureSelection] = useState('')
  const [customLecture, setCustomLecture] = useState('')
  const [begruendung, setBegruendung] = useState('')
  const [anzahl, setAnzahl] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isKurssprecher = role === 'Kurssprecher'
  const isAdmin = role === 'Admin'
  const isStudent = role === 'Student'
  const canChooseEventType = isAdmin || isKurssprecher
  const hasStudents = students.length > 0

  useEffect(() => {
    if (canChooseEventType) return
    setEventType('plus')
  }, [canChooseEventType])

  useEffect(() => {
    if (eventType === 'plus') {
      setAnzahl('1')
    }
  }, [eventType])

  useEffect(() => {
    if (!students.length) {
      setSelectedStudentId('')
      return
    }
    const exists = students.some((student) => student.studentId === selectedStudentId)
    if (!exists) {
      setSelectedStudentId(students[0].studentId)
    }
  }, [students, selectedStudentId])

  useEffect(() => {
    if (eventType === 'minus') return
    if (lectureSelection) return
    if (lectureOptions.length > 0) {
      setLectureSelection(lectureOptions[0])
    }
  }, [eventType, lectureOptions, lectureSelection])

  const vorlesungValue = useMemo(() => {
    if (eventType === 'minus') return MINUS_VORLESUNG
    if (lectureSelection === CUSTOM_LECTURE_VALUE) return customLecture
    return lectureSelection
  }, [eventType, lectureSelection, customLecture])

  useEffect(() => {
    let active = true
    const loadStudents = async (showLoading = true) => {
      if (!active) return
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const data = await DataService.getStudents()
        if (!active) return
        const list = data ?? []
        setStudents(list)
        if (list.length > 0) {
          setSelectedStudentId((prev) => prev || list[0].studentId)
        }
      } catch (loadError) {
        if (!active) return
        const message =
          loadError instanceof Error ? loadError.message : 'Backend nicht erreichbar'
        setError(message)
      } finally {
        if (active && showLoading) setIsLoading(false)
      }
    }

    loadStudents(true)

    const handleRefresh = () => loadStudents(false)
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
    if (!success) return
    const timer = window.setTimeout(() => setSuccess(null), 2200)
    return () => window.clearTimeout(timer)
  }, [success])

  const parseAmount = () => {
    const parsed = Math.trunc(Number(anzahl))
    if (!Number.isFinite(parsed) || parsed < 1) return null
    return parsed
  }

  const resetForm = () => {
    setBegruendung('')
    setAnzahl('1')
    setCustomLecture('')
    if (!canChooseEventType) {
      setEventType('plus')
    }
    if (lectureOptions.length > 0) {
      setLectureSelection(lectureOptions[0])
    }
  }

  const addLectureOption = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (lectureOptions.includes(trimmed)) return
    const next = [...lectureOptions, trimmed]
    setLectureOptions(next)
    storeLectures(next)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedStudentId = selectedStudentId.trim()
    if (!trimmedStudentId) {
      setError('Bitte einen Verursacher auswählen.')
      return
    }

    const trimmedReason = begruendung.trim()
    if (!trimmedReason) {
      setError('Bitte eine Begründung angeben.')
      return
    }

    if (!vorlesungValue.trim()) {
      setError('Bitte eine Vorlesung angeben.')
      return
    }

    const amount = eventType === 'minus' ? parseAmount() : 1
    if (!amount) {
      setError('Bitte eine gültige Anzahl an Strichen angeben.')
      return
    }

    if (lectureSelection === CUSTOM_LECTURE_VALUE && customLecture.trim()) {
      addLectureOption(customLecture)
    }

    const signedAmount = eventType === 'minus' ? -amount : amount

    setIsSubmitting(true)
    try {
      if (eventType === 'minus') {
        for (let i = 0; i < amount; i += 1) {
          await DataService.createMinus({
            studentId: trimmedStudentId,
            begruendung: trimmedReason,
          })
        }
      } else {
        await DataService.createEvent({
          studentId: trimmedStudentId,
          vorlesung: vorlesungValue.trim(),
          begruendung: trimmedReason,
          typ: 'plus',
        })
      }
      const valueLabel = signedAmount > 0 ? `+${signedAmount}` : `${signedAmount}`
      const toastMessage =
        amount === 1
          ? `Event gespeichert (${valueLabel}).`
          : `${amount} Events gespeichert (${valueLabel}).`
      setSuccess(toastMessage)
      resetForm()
      Refresh.trigger()
      window.setTimeout(() => {
        navigate('/events', { replace: true, state: { toast: toastMessage } })
      }, 900)
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unbekannter Fehler'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const parsedAmount = eventType === 'minus' ? parseAmount() : 1
  const signedDisplay =
    parsedAmount !== null ? (eventType === 'minus' ? -parsedAmount : 1) : null
  const isReasonValid = begruendung.trim().length > 0
  const canSubmit =
    !isSubmitting &&
    hasStudents &&
    isReasonValid &&
    !!selectedStudentId.trim() &&
    !!vorlesungValue.trim() &&
    (eventType === 'plus' || parsedAmount !== null)

  return (
    <section className="page-section">
      <div className="container">
        <h1>Event erfassen</h1>
        <p className="section-intro">
          Plus-Events (Störungen) und Bier-Ausgaben werden als eigenständige Buchungen
          gespeichert.
        </p>
        {isStudent ? (
          <div className="admin-helper">
            Hier kannst du eine neue Störung für die Liste erfassen.
          </div>
        ) : null}
        {error ? <div className="status-toast error">{error}</div> : null}
        {success ? <div className="status-toast">{success}</div> : null}
        {isLoading ? (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" /> Lade Studierende…
          </div>
        ) : (
          <div className="card">
            {!hasStudents ? (
              <div className="admin-warning">
                Keine Studierenden vorhanden. Bitte zuerst Teilnehmer anlegen.
              </div>
            ) : null}
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="student-select">Verursacher</label>
                <select
                  id="student-select"
                  className="select"
                  value={selectedStudentId}
                  onChange={(inputEvent) => setSelectedStudentId(inputEvent.target.value)}
                  disabled={!hasStudents}
                  required
                >
                      {students.map((student) => (
                        <option key={student.studentId} value={student.studentId}>
                          {formatUmlauts(student.name)} ({student.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

              <div className="form-field">
                <label>Event-Typ</label>
                {canChooseEventType ? (
                  <div className="event-toggle" role="radiogroup" aria-label="Event-Typ">
                    <label
                      className={`event-option plus${eventType === 'plus' ? ' active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="event-type"
                        value="plus"
                        checked={eventType === 'plus'}
                        onChange={() => setEventType('plus')}
                      />
                      Störung (Plus)
                    </label>
                    <label
                      className={`event-option minus${eventType === 'minus' ? ' active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="event-type"
                        value="minus"
                        checked={eventType === 'minus'}
                        onChange={() => setEventType('minus')}
                      />
                      Bier-Ausgabe (Minus)
                    </label>
                  </div>
                ) : (
                  <div className={`event-badge plus`}>Störung (Plus)</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="vorlesung-input">Vorlesung (Tag)</label>
                {eventType === 'minus' ? (
                  <input
                    id="vorlesung-input"
                    className="input"
                    type="text"
                    value={MINUS_VORLESUNG}
                    disabled
                    required
                  />
                ) : (
                  <>
                    <select
                      id="vorlesung-input"
                      className="select"
                      value={lectureSelection}
                      onChange={(inputEvent) => setLectureSelection(inputEvent.target.value)}
                      required
                    >
                      {lectureOptions.map((lecture) => (
                        <option key={lecture} value={lecture}>
                          {formatUmlauts(lecture)}
                        </option>
                      ))}
                      <option value={CUSTOM_LECTURE_VALUE}>Andere Vorlesung…</option>
                    </select>
                    {lectureSelection === CUSTOM_LECTURE_VALUE ? (
                      <div className="inline-actions">
                        <input
                          className="input"
                          type="text"
                          value={customLecture}
                          onChange={(inputEvent) => setCustomLecture(inputEvent.target.value)}
                          placeholder="Neue Vorlesung eingeben"
                        />
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => {
                            if (!customLecture.trim()) {
                              setError('Bitte eine Vorlesung angeben.')
                              return
                            }
                            addLectureOption(customLecture)
                            setLectureSelection(customLecture.trim())
                            setCustomLecture('')
                          }}
                        >
                          Hinzufügen
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
                {eventType === 'minus' ? (
                  <div className="admin-helper">
                    Vorlesung wird automatisch als Bier-Ausgabe gespeichert.
                  </div>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="anzahl-input">Anzahl Striche</label>
                {eventType === 'minus' ? (
                  <input
                    id="anzahl-input"
                    className="input"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={anzahl}
                    onChange={(inputEvent) => setAnzahl(inputEvent.target.value)}
                    required
                  />
                ) : (
                  <input
                    id="anzahl-input"
                    className="input"
                    type="number"
                    value="1"
                    disabled
                  />
                )}
                {signedDisplay !== null ? (
                  <div className={`event-sign ${eventType}`}>
                    Wert: {signedDisplay > 0 ? `+${signedDisplay}` : signedDisplay}
                  </div>
                ) : null}
                {eventType === 'minus' ? (
                  <div className="admin-helper">
                    Mehrere Striche erzeugen mehrere Buchungen.
                  </div>
                ) : (
                  <div className="admin-helper">
                    Störungen werden immer mit genau einem Strich gespeichert.
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="begruendung-input">Begründung</label>
                <textarea
                  id="begruendung-input"
                  className="textarea"
                  value={begruendung}
                  onChange={(inputEvent) => setBegruendung(inputEvent.target.value)}
                  placeholder="z.B. Handy hat geklingelt"
                  required
                />
              </div>

              <div className="inline-actions">
                <button
                  className="button primary"
                  type="submit"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? 'Speichern…' : 'Event speichern'}
                </button>
                <button
                  className="button secondary"
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Zurücksetzen
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
