import { CheckCircle, CircleNotch, Clock, CloudArrowUp, WarningCircle } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import type { DocumentStatus } from '@/types/api'
import styles from './StatusBadge.module.css'

export type BadgeStatus = DocumentStatus | 'uploading'

interface BadgeConfig {
  label: string
  tone: 'accent' | 'success' | 'danger' | 'neutral'
  Glyph: Icon
  spin?: boolean
}

const CONFIG: Record<BadgeStatus, BadgeConfig> = {
  uploading: { label: 'Загрузка…', tone: 'accent', Glyph: CloudArrowUp },
  queued: { label: 'В очереди', tone: 'neutral', Glyph: Clock },
  indexing: { label: 'Индексация…', tone: 'accent', Glyph: CircleNotch, spin: true },
  ready: { label: 'Готово', tone: 'success', Glyph: CheckCircle },
  error: { label: 'Ошибка', tone: 'danger', Glyph: WarningCircle },
}

export function StatusBadge({ status, className }: { status: BadgeStatus; className?: string }) {
  const { label, tone, Glyph, spin } = CONFIG[status]
  return (
    <span className={cn(styles.badge, styles[tone], className)}>
      <Glyph weight="bold" className={cn(styles.icon, spin && styles.spin)} aria-hidden />
      {label}
    </span>
  )
}
