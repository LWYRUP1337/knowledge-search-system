import { apiFetch, ApiError } from './client'
import { API_BASE_URL } from '@/lib/env'
import { useAppStore } from '@/store/app-store'
import type { ApiErrorBody, DocumentDto, DocumentStatusFilter, Paginated } from '@/types/api'

export interface ListDocumentsParams {
  page?: number
  size?: number
  status?: DocumentStatusFilter
  query?: string
}

export function listDocuments(params: ListDocumentsParams = {}): Promise<Paginated<DocumentDto>> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.size) search.set('size', String(params.size))
  if (params.status && params.status !== 'all') search.set('status', params.status)
  if (params.query) search.set('query', params.query)
  const qs = search.toString()
  return apiFetch<Paginated<DocumentDto>>(`/documents${qs ? `?${qs}` : ''}`)
}

export function getDocument(id: string): Promise<DocumentDto> {
  return apiFetch<DocumentDto>(`/documents/${id}`)
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/documents/${id}`, { method: 'DELETE' })
}

export interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export function uploadDocument(file: File, options: UploadOptions = {}): Promise<DocumentDto> {
  return new Promise<DocumentDto>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/documents/upload`)
    xhr.responseType = 'json'
    xhr.timeout = 120_000

    const token = useAppStore.getState().token
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as DocumentDto)
      } else {
        const body = xhr.response as ApiErrorBody | null
        reject(new ApiError(body?.message ?? `Ошибка загрузки (${xhr.status})`, xhr.status))
      }
    }
    xhr.onerror = () => reject(new ApiError('Сетевая ошибка при загрузке', 0))
    xhr.ontimeout = () => reject(new ApiError('Превышено время ожидания загрузки', 0))
    xhr.onabort = () => reject(new DOMException('Загрузка отменена', 'AbortError'))

    if (options.signal) {
      if (options.signal.aborted) {
        xhr.abort()
        return
      }
      options.signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    const form = new FormData()
    form.append('file', file)
    form.append('name', file.name)
    xhr.send(form)
  })
}
