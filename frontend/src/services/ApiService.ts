import { getRequestAccessKey } from '../auth/roles'

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

const normalizeBaseUrl = (baseUrl: string) => {
  const trimmed = baseUrl.replace(/\/+$/, '')
  if (/\/api\/v\d+$/.test(trimmed)) return trimmed
  if (/\/api$/.test(trimmed)) return `${trimmed}/v1`
  return `${trimmed}/api/v1`
}

export const API_BASE_URL = normalizeBaseUrl(RAW_BASE_URL)

export const buildHeaders = (withJson = true): HeadersInit => {
  const accessKey = getRequestAccessKey()
  return {
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
    ...(accessKey ? { 'x-access-key': accessKey } : {}),
  }
}

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const url = buildApiUrl(path)
  console.log(`Calling: ${url}`)

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...buildHeaders(method !== 'GET'),
        ...options.headers,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (
      message.includes('ECONNREFUSED') ||
      message.includes('Failed to fetch') ||
      message.includes('NetworkError')
    ) {
      throw new Error('Datenbankverbindung fehlgeschlagen')
    }
    throw error instanceof Error ? error : new Error('Unbekannter Fehler')
  }

  if (!response.ok) {
    const text = await response.text()
    console.log('API-Fehler', {
      method,
      url,
      status: response.status,
      body: text,
    })
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function deleteStudent(id: string): Promise<void> {
  const encoded = encodeURIComponent(id)
  return request<void>(`/students/${encoded}`, { method: 'DELETE' })
}
