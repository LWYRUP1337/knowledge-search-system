import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

function pageItems(page: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: Array<number | 'gap'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) items.push('gap')
  for (let p = start; p <= end; p += 1) items.push(p)
  if (end < total - 1) items.push('gap')
  items.push(total)
  return items
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className={cn(styles.root, className)} aria-label="Постраничная навигация">
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Предыдущая страница"
      >
        <CaretLeft weight="bold" />
      </button>

      <ul className={styles.list}>
        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={cn(styles.page, item === page && styles.active)}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Следующая страница"
      >
        <CaretRight weight="bold" />
      </button>
    </nav>
  )
}
