const INACTIVE_STUDENTS_KEY = 'bierlog.students.inactive'

type InactiveStudentMap = Record<string, string>

const isBrowser = typeof window !== 'undefined'

export const getInactiveStudents = (): InactiveStudentMap => {
  if (!isBrowser) return {}
  const raw = window.localStorage.getItem(INACTIVE_STUDENTS_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as InactiveStudentMap
    return parsed ?? {}
  } catch {
    return {}
  }
}

export const markStudentInactive = (studentId: string, name: string) => {
  if (!isBrowser) return
  const current = getInactiveStudents()
  const next: InactiveStudentMap = { ...current, [studentId]: name }
  window.localStorage.setItem(INACTIVE_STUDENTS_KEY, JSON.stringify(next))
}

export const removeInactiveStudent = (studentId: string) => {
  if (!isBrowser) return
  const current = getInactiveStudents()
  if (!(studentId in current)) return
  const next: InactiveStudentMap = { ...current }
  delete next[studentId]
  window.localStorage.setItem(INACTIVE_STUDENTS_KEY, JSON.stringify(next))
}
