export const SEARCH_PAGE_SIZE = 10

export const DOCUMENTS_PAGE_SIZE = 12

export const ACCEPTED_MIME: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export const ACCEPTED_LABEL = 'PDF, DOCX'

export const MAX_FILE_SIZE = 25 * 1024 * 1024
