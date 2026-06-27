import { apiFetch } from './client'
import type { SearchHistoryItemDto, SearchResponse } from '@/types/api'

export interface SearchParams {
  q: string
  page?: number
  size?: number
}

export function search({ q, page = 1, size }: SearchParams): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, page: String(page) })
  if (size) params.set('size', String(size))
  return apiFetch<SearchResponse>(`/search?${params.toString()}`)
}

export function getHistory(limit = 50): Promise<SearchHistoryItemDto[]> {
  return apiFetch<SearchHistoryItemDto[]>(`/search/history?limit=${limit}`)
}

export function deleteHistoryItem(id: string): Promise<void> {
  return apiFetch<void>(`/search/history/${id}`, { method: 'DELETE' })
}

export function clearHistory(): Promise<void> {
  return apiFetch<void>('/search/history', { method: 'DELETE' })
}
