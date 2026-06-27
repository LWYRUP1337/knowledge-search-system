import { http, HttpResponse, delay } from 'msw'
import { API_BASE_URL } from '@/lib/env'
import type { DocumentStatusFilter } from '@/types/api'
import * as db from './db'

function url(path: string): string {
  return `${API_BASE_URL}${path}`
}

function numParam(source: URL, key: string, fallback?: number): number | undefined {
  const raw = source.searchParams.get(key)
  if (raw === null) return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function prettyName(login: string): string {
  const base = login.includes('@') ? login.slice(0, login.indexOf('@')) : login
  return (
    base
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Пользователь'
  )
}

function isAuthorized(request: Request): boolean {
  return Boolean(request.headers.get('Authorization'))
}

export const handlers = [
  http.post(url('/auth/login'), async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { login?: string; password?: string } | null
    await delay(600)
    if (!body?.login || !body?.password) {
      return HttpResponse.json({ message: 'Введите логин и пароль' }, { status: 400 })
    }
    const encoded = btoa(unescape(encodeURIComponent(body.login)))
    return HttpResponse.json({
      token: `mock-token.${encoded}`,
      user: { id: 'u-1', login: body.login, name: prettyName(body.login) },
    })
  }),

  http.post(url('/auth/logout'), async () => {
    await delay(150)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(url('/auth/me'), ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }
    return HttpResponse.json({ id: 'u-1', login: 'demo', name: 'Demo User' })
  }),

  http.get(url('/documents'), async ({ request }) => {
    const source = new URL(request.url)
    await delay(250)
    return HttpResponse.json(
      db.listDocuments({
        page: numParam(source, 'page', 1),
        size: numParam(source, 'size'),
        status: (source.searchParams.get('status') ?? 'all') as DocumentStatusFilter,
        query: source.searchParams.get('query') ?? undefined,
      }),
    )
  }),

  http.get(url('/documents/:id'), ({ params }) => {
    const doc = db.getDocument(String(params.id))
    if (!doc) return HttpResponse.json({ message: 'Документ не найден' }, { status: 404 })
    return HttpResponse.json(doc)
  }),

  http.post(url('/documents'), async ({ request }) => {
    const form = await request.formData().catch(() => null)
    await delay(500)
    const file = form?.get('file')
    if (!form || !(file instanceof File)) {
      return HttpResponse.json({ message: 'Файл не передан' }, { status: 400 })
    }
    const name = (form.get('name') as string | null) ?? file.name
    return HttpResponse.json(db.createDocument({ name, size: file.size, mimeType: file.type }), {
      status: 201,
    })
  }),

  http.delete(url('/documents/:id'), async ({ params }) => {
    await delay(200)
    const removed = db.deleteDocument(String(params.id))
    if (!removed) return HttpResponse.json({ message: 'Документ не найден' }, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(url('/search'), async ({ request }) => {
    const source = new URL(request.url)
    const query = (source.searchParams.get('q') ?? '').trim()
    const page = numParam(source, 'page', 1) ?? 1
    const size = numParam(source, 'size')
    await delay(380)

    if (!query) {
      return HttpResponse.json({
        query: '',
        items: [],
        total: 0,
        page: 1,
        size: size ?? 10,
        totalPages: 1,
        tookMs: 0,
      })
    }

    const result = db.searchDocuments(query, page, size)
    if (page === 1) db.addHistory(query, result.total)
    return HttpResponse.json(result)
  }),

  http.get(url('/search/history'), ({ request }) => {
    const source = new URL(request.url)
    return HttpResponse.json(db.getHistory(numParam(source, 'limit', 50)))
  }),

  http.delete(url('/search/history/:id'), async ({ params }) => {
    await delay(120)
    if (!db.deleteHistory(String(params.id))) {
      return HttpResponse.json({ message: 'Запрос не найден' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(url('/search/history'), async () => {
    await delay(120)
    db.clearHistoryAll()
    return new HttpResponse(null, { status: 204 })
  }),
]
