import { request } from './ApiService'

export type Student = {
  studentId: string
  name: string
  kurs?: string
}

export type Balance = {
  studentId: string
  name: string
  kurs?: string
  striche: number
}

export type EventType = 'plus' | 'minus' | 'correction' | 'korrektur'

export type EventRecord = {
  timestamp: string
  studentId: string
  vorlesung: string
  typ: EventType
  begruendung: string
  anzahl: number
}

export type CreateEventInput = {
  studentId: string
  vorlesung: string
  begruendung: string
  typ?: EventType
}

export type CreateMinusInput = {
  studentId: string
  begruendung: string
}

export type CreateCorrectionInput = {
  studentId: string
  begruendung: string
  anzahl: number
}

export type CreateStudentInput = {
  name: string
  kurs?: string
}

export const DataService = {
  getStudents: () => request<Student[]>('/students'),
  getBalances: () => request<Balance[]>('/students/balance'),
  getEvents: (studentId?: string) =>
    request<EventRecord[]>(
      `/events${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''}`,
    ),
  createEvent: (input: CreateEventInput) =>
    request<{ message: string; timestamp?: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  createMinus: (input: CreateMinusInput) =>
    request<{ message: string; timestamp?: string }>('/events/minus', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  createCorrection: (input: CreateCorrectionInput) =>
    request<{ message: string }>('/events/correct', {
      method: 'POST',
      body: JSON.stringify({
        studentId: input.studentId,
        begruendung: input.begruendung,
        anzahl: Math.trunc(input.anzahl),
      }),
    }),
  createStudent: (input: CreateStudentInput) =>
    request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        ...(input.kurs ? { kurs: input.kurs } : {}),
      }),
    }),
}
