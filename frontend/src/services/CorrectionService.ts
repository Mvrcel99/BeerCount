export type EventRecord = {
  timestamp: string
  studentId: string
  vorlesung: string
  typ: string
  begruendung: string
  anzahl: number
}

export type CorrectionInput = {
  studentId: string
  begruendung: string
  anzahl: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY ?? ''

const baseHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(ACCESS_KEY ? { 'x-access-key': ACCESS_KEY } : {}),
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const CorrectionService = {
  listEvents: () => request<EventRecord[]>('/events'),
  createCorrection: (input: CorrectionInput) =>
    request<{ message: string }>('/events/correct', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
