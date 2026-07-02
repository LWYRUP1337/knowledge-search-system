import type { ComponentPropsWithoutRef } from 'react'
import { Trash } from '@phosphor-icons/react'
import { FileIcon } from './FileIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { IconButton } from '@/components/ui/IconButton'
import { formatBytes, formatDateTime, plural } from '@/lib/format'
import type { DocumentDto } from '@/types/api'
import { cn } from '@/lib/cn'
import styles from './DocumentCard.module.css'

export interface DocumentCardProps extends ComponentPropsWithoutRef<'article'> {
  doc: DocumentDto
  onDelete: (doc: DocumentDto) => void
  deleting?: boolean
}

export function DocumentCard({ doc, onDelete, deleting, className, ...rest }: DocumentCardProps) {
  const isIndexing = doc.status === 'indexing' || doc.status === 'queued'

  return (
    <article className={cn(styles.card, doc.status === 'error' && styles.errorCard, className)} {...rest}>
      <div className={styles.top}>
        <FileIcon mimeType={doc.mimeType || doc.name} />
        <div className={styles.info}>
          <h3 className={styles.name} title={doc.name}>
            {doc.name}
          </h3>
          <p className={styles.meta}>
            <span>{formatDateTime(doc.uploadedAt)}</span>
            <span className="font-mono">{formatBytes(doc.size)}</span>
            {doc.pages != null && (
              <span>
                {doc.pages} {plural(doc.pages, 'страница', 'страницы', 'страниц')}
              </span>
            )}
          </p>
        </div>
        <IconButton
          label={`Удалить документ ${doc.name}`}
          variant="danger"
          size="sm"
          onClick={() => onDelete(doc)}
          disabled={deleting}
        >
          <Trash weight="bold" />
        </IconButton>
      </div>

      <div className={styles.bottom}>
        <div className={styles.statusRow}>
          <StatusBadge status={doc.status} />
          {isIndexing && <span className={cn('font-mono', styles.percent)}>{doc.progress}%</span>}
        </div>
        {isIndexing && (
          <ProgressBar value={doc.progress} size="sm" label={`Индексация ${doc.name}`} />
        )}
        {doc.status === 'error' && doc.error && (
          <p className={styles.errorText} title={doc.error}>
            {doc.error}
          </p>
        )}
      </div>
    </article>
  )
}
