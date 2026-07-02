const BYTE_UNITS = ['Б', 'КБ', 'МБ', 'ГБ'] as const

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Б'
  const k = 1024
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), BYTE_UNITS.length - 1)
  const value = bytes / Math.pow(k, i)
  const formatted = i === 0 ? String(value) : value.toFixed(decimals)
  return `${formatted} ${BYTE_UNITS[i]}`
}

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return dateTimeFormatter.format(date)
}

export function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return 'только что'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} ${plural(min, 'минуту', 'минуты', 'минут')} назад`
  const hours = Math.round(min / 60)
  if (hours < 24) return `${hours} ${plural(hours, 'час', 'часа', 'часов')} назад`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`
  return formatDateTime(iso)
}

export function formatScore(score: number): string {
  return `${Math.round(clamp01(score) * 100)}%`
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}
