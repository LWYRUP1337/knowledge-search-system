import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './IconButton.module.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'ghost' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(styles.iconButton, styles[variant], styles[size], className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden>
        {children}
      </span>
    </button>
  )
})
