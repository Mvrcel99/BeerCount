import { FormEvent, useState } from 'react'
import { DataService } from '../../services/DataService'
import { isAdminAccessKeyActive } from '../../auth/roles'

type UserCreationFormProps = {
  onCreated?: () => void
}

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

    if (!isAdminAccessKeyActive()) {
      const message = 'Aktion erfordert ADMIN_KEY_123 im Access Key.'
      setError(message)
      console.log(message)
      return
    }

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

      const created = await DataService.createStudent(payload)
      setSuccess(`Student wurde angelegt (ID: ${created.studentId}).`)
      setName('')
      setKurs('')
      onCreated?.()
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unbekannter Fehler'
      console.log('Student anlegen fehlgeschlagen', submitError)
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
