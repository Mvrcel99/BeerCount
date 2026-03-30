import { useEffect, useMemo, useState } from 'react'
import { DataService, type Balance } from '../services/DataService'
import { Refresh } from '../utils/refresh'

export default function Dashboard() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sortedBalances = useMemo(() => {
    return [...balances].sort((a, b) => {
      if (b.striche !== a.striche) return b.striche - a.striche
      return a.name.localeCompare(b.name, 'de')
    })
  }, [balances])

  useEffect(() => {
    let active = true
    const loadBalances = async (showLoading = true) => {
      if (!active) return
      if (showLoading) setIsLoading(true)
      setError(null)
      try {
        const data = await DataService.getBalances()
        if (!active) return
        setBalances(data ?? [])
      } catch (loadError) {
        if (!active) return
        const message =
          loadError instanceof Error ? loadError.message : 'Backend nicht erreichbar'
        setError(message)
      } finally {
        if (active && showLoading) setIsLoading(false)
      }
    }

    loadBalances(true)

    const handleRefresh = () => loadBalances(false)
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
                  <th scope="col">Rang</th>
                  <th scope="col">Name</th>
                  <th scope="col">Striche</th>
                </tr>
              </thead>
              <tbody>
                {sortedBalances.map((student, index) => {
                  const rank = index + 1
                  const rowClass = rank <= 3 ? `leaderboard top-${rank}` : 'leaderboard'
                  return (
                    <tr key={student.studentId} className={rowClass}>
                      <td>{rank === 1 ? '1' : rank}</td>
                      <td>{student.name}</td>
                      <td>{student.striche}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="meta-hint">Basis: {balances.length} Teilnehmer</p>
      </div>
    </section>
  )
}
