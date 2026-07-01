export type DocumentStatus = 'queued' | 'indexing' | 'ready' | 'error'

export interface DocumentDto {
  id: string
  name: string
  size: number
  mimeType: string
  pages: number | null
  status: DocumentStatus
  progress: number
  uploadedAt: string
  indexedAt: string | null
  error: string | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface SearchHighlight {
  start: number
  end: number
}

export interface SearchResultDto {
  id: string
  documentId: string
  fileName: string
  page: number
  snippet: string
  score: number
  highlights?: SearchHighlight[]
}

export interface SearchResponse extends Paginated<SearchResultDto> {
  query: string
  tookMs: number
}

export interface SearchHistoryItemDto {
  id: string
  query: string
  createdAt: string
  resultsCount: number
}

export interface User {
  id: string
  login: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiErrorBody {
  message: string
  code?: string
}

export type DocumentStatusFilter = 'all' | DocumentStatus
