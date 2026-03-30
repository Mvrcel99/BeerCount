export const students = [
  { id: 's1', name: 'Anna Weber' },
  { id: 's2', name: 'Lukas Schmidt' },
  { id: 's3', name: 'Miriam Koch' },
  { id: 's4', name: 'Jonas Neumann' },
]

export const events = [
  {
    id: 'e1',
    studentId: 's1',
    typ: 'plus',
    anzahl: 2,
    begruendung: 'Getränk nach Abgabe',
    zeitstempel: '2026-02-24T18:12:00Z',
  },
  {
    id: 'e2',
    studentId: 's2',
    typ: 'minus',
    anzahl: 1,
    begruendung: 'Rückgabe',
    zeitstempel: '2026-02-25T09:30:00Z',
  },
  {
    id: 'e3',
    studentId: 's3',
    typ: 'plus',
    anzahl: 3,
    begruendung: 'Gruppenabend',
    zeitstempel: '2026-02-26T20:05:00Z',
  },
  {
    id: 'e4',
    studentId: 's4',
    typ: 'plus',
    anzahl: 1,
    begruendung: 'Nachschub',
    zeitstempel: '2026-02-27T14:20:00Z',
  },
  {
    id: 'e5',
    studentId: 's1',
    typ: 'minus',
    anzahl: 1,
    begruendung: 'Ausgleich',
    zeitstempel: '2026-02-28T08:10:00Z',
  },
]
