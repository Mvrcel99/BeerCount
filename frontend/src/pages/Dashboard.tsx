import { events, students } from '../data/mockData'
import { berechneStricheProStudent } from '../utils/berechnungen'

export default function Dashboard() {
  const stricheProStudent = berechneStricheProStudent()

  return (
    <section className="page-section">
      <div className="container">
        <h1>Dashboard</h1>
        <p className="section-intro">
          Der Kontostand der Striche wird aus den erfassten Events berechnet.
        </p>
        <div className="card">
          <table className="data-table" aria-label="Striche pro Student">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Striche</th>
              </tr>
            </thead>
            <tbody>
              {stricheProStudent.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.striche}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="meta-hint">
          Basis: {students.length} Studenten, {events.length} Events
        </p>
      </div>
    </section>
  )
}
