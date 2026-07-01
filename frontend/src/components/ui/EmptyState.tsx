import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  tone?: 'default' | 'danger'
  className?: string
}

export function EmptyState({ icon, title, description, action, tone = 'default', className }: EmptyStateProps) {
  return (
    <div className={cn(styles.root, tone === 'danger' && styles.danger, className)} role="status">
      {icon && (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
