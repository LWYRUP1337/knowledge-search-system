import { apiFetch } from './client'
import type { AuthResponse, User } from '@/types/api'

export interface Credentials {
  login: string
  password: string
}

export function login(credentials: Credentials): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}

export function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me')
}
