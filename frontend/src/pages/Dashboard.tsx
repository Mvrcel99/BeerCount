import { useEffect, useState } from 'react'
import { DataService, type Balance } from '../services/DataService'

export default function Dashboard() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    DataService.getBalances()
      .then((data) => {
        if (!active) return
        setBalances(data ?? [])
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

  return (
    <section className="page-section">
      <div className="container">
        <h1>Dashboard</h1>
        <p className="section-intro">
          Der Kontostand der Striche wird aus den erfassten Events berechnet.
        </p>
        {error ? <div className="status-toast error">{error}</div> : null}
        <div className="card">
          {isLoading ? (
            <div className="loading-state">
              <span className="spinner" aria-hidden="true" /> Lädt Kontostände…
            </div>
          ) : (
            <table className="data-table" aria-label="Striche pro Student">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Striche</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((student) => (
                  <tr key={student.studentId}>
                    <td>{student.name}</td>
                    <td>{student.striche}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="meta-hint">Basis: {balances.length} Teilnehmer</p>
      </div>
    </section>
  )
}
