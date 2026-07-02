import type { ComponentPropsWithoutRef } from 'react'
import { FileIcon } from '@/components/documents/FileIcon'
import { highlight } from '@/lib/highlight'
import { formatScore } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { SearchResultDto } from '@/types/api'
import styles from './ResultCard.module.css'

function mimeFromName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return 'application/octet-stream'
}

export interface ResultCardProps extends ComponentPropsWithoutRef<'article'> {
  result: SearchResultDto
  query: string
}

export function ResultCard({ result, query, className, ...rest }: ResultCardProps) {
  return (
    <article className={cn(styles.card, className)} {...rest}>
      <div className={styles.head}>
        <FileIcon mimeType={mimeFromName(result.fileName)} className={styles.icon} />
        <div className={styles.headInfo}>
          <h3 className={styles.name} title={result.fileName}>
            {result.fileName}
          </h3>
          <p className={styles.location}>Страница {result.page}</p>
        </div>
        <div className={styles.score}>
          <span className={styles.scoreValue}>{formatScore(result.score)}</span>
          <span className={styles.meter} aria-hidden>
            <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, result.score))})` }} />
          </span>
          <span className={styles.scoreLabel}>релевантность</span>
        </div>
      </div>
      <p className={styles.snippet}>{highlight(result.snippet, query)}</p>
    </article>
  )
}
