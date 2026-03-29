import { FormEvent, useState } from 'react'

type UserCreationFormProps = {
  onCreated?: () => void
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY ?? ''

export default function UserCreationForm({ onCreated }: UserCreationFormProps) {
  const [name, setName] = useState('')
  const [kurs, setKurs] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSubmit = name.trim().length > 0 && !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('Bitte einen Namen angeben.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        ...(kurs.trim() ? { kurs: kurs.trim() } : {}),
      }

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ACCESS_KEY ? { 'x-access-key': ACCESS_KEY } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Request failed with status ${response.status}`)
      }

      const created = (await response.json()) as { studentId: string; name: string; kurs?: string }
      setSuccess(`Student wurde angelegt (ID: ${created.studentId}).`)
      setName('')
      setKurs('')
      onCreated?.()
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unbekannter Fehler'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="student-name">Name</label>
        <input
          id="student-name"
          className="input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="z.B. Max Mustermann"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="student-kurs">Kurs (optional)</label>
        <input
          id="student-kurs"
          className="input"
          type="text"
          value={kurs}
          onChange={(event) => setKurs(event.target.value)}
          placeholder="z.B. WWI24a"
        />
      </div>
      {error ? <div className="admin-warning">{error}</div> : null}
      {success ? <div className="admin-helper">{success}</div> : null}
      <div className="inline-actions">
        <button className="button primary" type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Speichern…' : 'Student anlegen'}
        </button>
      </div>
    </form>
  )
}
