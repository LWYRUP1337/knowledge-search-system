import { DOCUMENTS_PAGE_SIZE, SEARCH_PAGE_SIZE } from '@/lib/constants'
import type {
  DocumentDto,
  DocumentStatusFilter,
  Paginated,
  SearchHistoryItemDto,
  SearchResponse,
  SearchResultDto,
} from '@/types/api'
import { seedDocuments } from './corpus'

interface Passage {
  page: number
  text: string
}

interface DocRecord {
  doc: DocumentDto
  passages: Passage[]
  dynamic?: { startedAt: number; durationMs: number; fail: boolean; failMessage?: string }
}

const SNIPPET_BEFORE = 90
const SNIPPET_AFTER = 170
const SEED_INDEXING_MS = 7000

const records: DocRecord[] = []
const history: SearchHistoryItemDto[] = []

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function isoFromNow(offsetMs: number): string {
  return new Date(Date.now() - offsetMs).toISOString()
}

function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[\s,.;:!?()"'«»-]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  )
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0
  return haystack.split(needle).length - 1
}

function buildSnippet(text: string, query: string): string {
  const tokens = tokenize(query)
  const lower = text.toLowerCase()
  let index = -1
  for (const token of tokens) {
    const found = lower.indexOf(token)
    if (found !== -1 && (index === -1 || found < index)) index = found
  }
  if (index === -1) {
    return text.length > 240 ? `${text.slice(0, 240).trimEnd()} …` : text
  }

  let start = Math.max(0, index - SNIPPET_BEFORE)
  let end = Math.min(text.length, index + SNIPPET_AFTER)
  if (start > 0) {
    const space = text.indexOf(' ', start)
    if (space !== -1 && space < index) start = space + 1
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end)
    if (space > index) end = space
  }

  let snippet = text.slice(start, end).trim()
  if (start > 0) snippet = `… ${snippet}`
  if (end < text.length) snippet = `${snippet} …`
  return snippet
}

function materialize(record: DocRecord): DocumentDto {
  const dynamic = record.dynamic
  if (!dynamic || (record.doc.status !== 'indexing' && record.doc.status !== 'queued')) {
    return record.doc
  }

  const elapsed = Date.now() - dynamic.startedAt

  if (dynamic.fail && elapsed >= dynamic.durationMs * 0.6) {
    record.doc = {
      ...record.doc,
      status: 'error',
      progress: 0,
      error: dynamic.failMessage ?? 'Ошибка индексации документа',
    }
    record.dynamic = undefined
    return record.doc
  }

  if (!dynamic.fail && elapsed >= dynamic.durationMs) {
    record.doc = {
      ...record.doc,
      status: 'ready',
      progress: 100,
      pages: record.passages.length || randomInt(3, 28),
      indexedAt: new Date().toISOString(),
    }
    record.dynamic = undefined
    return record.doc
  }

  const progress = Math.min(99, Math.max(2, Math.floor((elapsed / dynamic.durationMs) * 100)))
  record.doc = { ...record.doc, status: 'indexing', progress }
  return record.doc
}

function seed(): void {
  seedDocuments.forEach((item, index) => {
    const status = item.seedStatus ?? 'ready'
    const uploadedAt = isoFromNow(item.daysAgo * 86_400_000 + index * 3_600_000)
    const passages: Passage[] = item.pages.map((text, idx) => ({ page: idx + 1, text }))

    if (status === 'ready') {
      records.push({
        doc: {
          id: item.id,
          name: item.name,
          size: item.size,
          mimeType: item.mimeType,
          pages: item.pages.length,
          status: 'ready',
          progress: 100,
          uploadedAt,
          indexedAt: uploadedAt,
          error: null,
        },
        passages,
      })
    } else if (status === 'indexing') {
      records.push({
        doc: {
          id: item.id,
          name: item.name,
          size: item.size,
          mimeType: item.mimeType,
          pages: null,
          status: 'indexing',
          progress: 0,
          uploadedAt,
          indexedAt: null,
          error: null,
        },
        passages,
        dynamic: { startedAt: Date.now(), durationMs: SEED_INDEXING_MS, fail: false },
      })
    } else {
      records.push({
        doc: {
          id: item.id,
          name: item.name,
          size: item.size,
          mimeType: item.mimeType,
          pages: null,
          status: 'error',
          progress: 0,
          uploadedAt,
          indexedAt: null,
          error: item.error ?? 'Не удалось обработать документ',
        },
        passages: [],
      })
    }
  })

  const seedQueries = ['договор оплата', 'персональные данные', 'информационная безопасность']
  seedQueries.forEach((query, index) => {
    history.push({
      id: crypto.randomUUID(),
      query,
      createdAt: isoFromNow((index + 1) * 5_400_000),
      resultsCount: rawSearch(query).length,
    })
  })
}

export interface ListParams {
  page?: number
  size?: number
  status?: DocumentStatusFilter
  query?: string
}

export function listDocuments(params: ListParams = {}): Paginated<DocumentDto> {
  let docs = records.map(materialize)

  if (params.status && params.status !== 'all') {
    docs = docs.filter((doc) => doc.status === params.status)
  }
  if (params.query) {
    const needle = params.query.toLowerCase()
    docs = docs.filter((doc) => doc.name.toLowerCase().includes(needle))
  }

  docs = docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  const size = params.size ?? DOCUMENTS_PAGE_SIZE
  const page = params.page ?? 1
  const total = docs.length
  const start = (page - 1) * size

  return {
    items: docs.slice(start, start + size),
    total,
    page,
    size,
    totalPages: Math.max(1, Math.ceil(total / size)),
  }
}

export function getDocument(id: string): DocumentDto | null {
  const record = records.find((item) => item.doc.id === id)
  return record ? materialize(record) : null
}

export interface CreateInput {
  name: string
  size: number
  mimeType: string
}

export function createDocument(input: CreateInput): DocumentDto {
  const id = crypto.randomUUID()
  const lower = input.name.toLowerCase()
  const fail = lower.includes('error') || lower.includes('ошибк') || lower.includes('fail')
  const uploadedAt = new Date().toISOString()

  const doc: DocumentDto = {
    id,
    name: input.name,
    size: input.size,
    mimeType: input.mimeType,
    pages: null,
    status: 'indexing',
    progress: 0,
    uploadedAt,
    indexedAt: null,
    error: null,
  }

  records.unshift({
    doc,
    passages: [],
    dynamic: {
      startedAt: Date.now(),
      durationMs: randomInt(2600, 4800),
      fail,
      failMessage: 'Файл повреждён или защищён паролем',
    },
  })

  return doc
}

export function deleteDocument(id: string): boolean {
  const index = records.findIndex((item) => item.doc.id === id)
  if (index === -1) return false
  records.splice(index, 1)
  return true
}

interface RawHit {
  record: DocRecord
  page: number
  text: string
  raw: number
}

function rawSearch(query: string): RawHit[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const phrase = query.trim().toLowerCase()
  const hits: RawHit[] = []

  for (const record of records) {
    const doc = materialize(record)
    if (doc.status !== 'ready') continue
    const nameLower = doc.name.toLowerCase()
    const nameMatches = tokens.some((token) => nameLower.includes(token))

    for (const passage of record.passages) {
      const textLower = passage.text.toLowerCase()
      let raw = 0
      let matched = false

      for (const token of tokens) {
        const occurrences = countOccurrences(textLower, token)
        if (occurrences > 0) {
          matched = true
          raw += occurrences
        }
      }
      if (nameMatches) raw += 1.5
      if (tokens.length > 1 && textLower.includes(phrase)) raw += 3

      if (matched) hits.push({ record, page: passage.page, text: passage.text, raw })
    }
  }

  return hits.sort((a, b) => b.raw - a.raw)
}

export function searchDocuments(query: string, page = 1, size = SEARCH_PAGE_SIZE): SearchResponse {
  const hits = rawSearch(query)
  const maxRaw = hits.length > 0 ? hits[0].raw : 1

  const all: SearchResultDto[] = hits.map((hit) => ({
    id: `${hit.record.doc.id}:${hit.page}`,
    documentId: hit.record.doc.id,
    fileName: hit.record.doc.name,
    page: hit.page,
    snippet: buildSnippet(hit.text, query),
    score: clamp01(0.35 + 0.65 * (hit.raw / maxRaw)),
  }))

  const total = all.length
  const start = (page - 1) * size

  return {
    query,
    items: all.slice(start, start + size),
    total,
    page,
    size,
    totalPages: Math.max(1, Math.ceil(total / size)),
    tookMs: randomInt(12, 64),
  }
}

export function addHistory(query: string, resultsCount: number): SearchHistoryItemDto {
  const item: SearchHistoryItemDto = {
    id: crypto.randomUUID(),
    query,
    createdAt: new Date().toISOString(),
    resultsCount,
  }
  history.unshift(item)
  if (history.length > 100) history.length = 100
  return item
}

export function getHistory(limit = 50): SearchHistoryItemDto[] {
  return history.slice(0, limit)
}

export function deleteHistory(id: string): boolean {
  const index = history.findIndex((item) => item.id === id)
  if (index === -1) return false
  history.splice(index, 1)
  return true
}

export function clearHistoryAll(): void {
  history.length = 0
}

seed()
