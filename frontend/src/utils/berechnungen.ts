import { events, students } from '../data/mockData'

export function berechneStricheProStudent() {
  const startwerte = new Map(students.map((student) => [student.id, 0]))

  for (const event of events) {
    const aktuellerWert = startwerte.get(event.studentId) ?? 0
    const delta = event.typ === 'plus' ? event.anzahl : -event.anzahl
    startwerte.set(event.studentId, aktuellerWert + delta)
  }

  return students
    .map((student) => ({
      ...student,
      striche: startwerte.get(student.id) ?? 0,
    }))
    .sort((a, b) => b.striche - a.striche)
}

export function formatiereDatum(isoDatum: string) {
  const datum = new Date(isoDatum)
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(datum)
}
