import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import styles from './Spinner.module.css'

export function Spinner({ className, label = 'Загрузка' }: { className?: string; label?: string }) {
  return <CircleNotch weight="bold" role="status" aria-label={label} className={cn(styles.spinner, className)} />
}

export function PageLoader({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <div className={styles.page}>
      <Spinner className={styles.big} label={label} />
    </div>
  )
}
