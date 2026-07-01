import { API_BASE_URL } from '@/lib/env'
import { useAppStore } from '@/store/app-store'
import type { ApiErrorBody } from '@/types/api'

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function authHeader(): Record<string, string> {
  const token = useAppStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader(),
        ...(init.headers as Record<string, string> | undefined),
      },
    })
  } catch {
    throw new ApiError('Не удалось соединиться с сервером', 0)
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload: unknown = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    if (response.status === 401) useAppStore.getState().clearSession()
    const body = (isJson ? (payload as ApiErrorBody) : null) ?? null
    const message =
      body?.message || (typeof payload === 'string' && payload) || `Ошибка запроса (${response.status})`
    throw new ApiError(message, response.status, body?.code)
  }

  return payload as T
}
