import { cn } from '@/lib/cn'
import styles from './ProgressBar.module.css'

export interface ProgressBarProps {
  value?: number
  tone?: 'accent' | 'success' | 'danger'
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

export function ProgressBar({ value, tone = 'accent', size = 'md', label, className }: ProgressBarProps) {
  const indeterminate = value === undefined
  const clamped = indeterminate ? 0 : Math.max(0, Math.min(100, value))

  return (
    <div
      className={cn(styles.track, styles[size], styles[tone], className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
    >
      <div
        className={cn(styles.fill, indeterminate && styles.indeterminate)}
        style={indeterminate ? undefined : { transform: `scaleX(${clamped / 100})` }}
      />
    </div>
  )
}
