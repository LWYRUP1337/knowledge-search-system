import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { toast } from 'sonner'
import { ArrowClockwise, FolderOpen, WarningOctagon } from '@phosphor-icons/react'
import { DocumentCard } from './DocumentCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useDeleteDocument, useDocuments } from '@/hooks/useDocuments'
import { plural } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DocumentDto, DocumentStatusFilter } from '@/types/api'
import styles from './DocumentList.module.css'

const FILTERS: Array<{ value: DocumentStatusFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'ready', label: 'Готовые' },
  { value: 'indexing', label: 'В обработке' },
  { value: 'error', label: 'С ошибками' },
]

export function DocumentList() {
  const [filter, setFilter] = useState<DocumentStatusFilter>('all')
  const { data, isPending, isError, refetch } = useDocuments(filter)
  const deleteDoc = useDeleteDocument()
  const gridRef = useRef<HTMLDivElement>(null)

  const items = data?.items ?? []

  const handleDelete = (doc: DocumentDto) => {
    deleteDoc.mutate(doc.id, {
      onSuccess: () => toast.success('Документ удалён', { description: doc.name }),
      onError: () => toast.error('Не удалось удалить документ'),
    })
  }

  useGSAP(
    () => {
      if (items.length === 0) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-card]', {
          y: 18,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.05,
        })
      })
    },
    { scope: gridRef, dependencies: [items.length, filter] },
  )

  return (
    <section className={styles.root} aria-label="Загруженные документы">
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Загруженные документы</h2>
          {data && (
            <span className={styles.count}>
              {data.total} {plural(data.total, 'документ', 'документа', 'документов')}
            </span>
          )}
        </div>

        <div className={styles.tabs} role="radiogroup" aria-label="Фильтр по статусу">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              className={cn(styles.tab, filter === value && styles.tabActive)}
              aria-checked={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {isPending ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height="9.5rem" radius="var(--radius-lg)" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          tone="danger"
          icon={<WarningOctagon weight="bold" />}
          title="Не удалось загрузить список"
          description="Попробуйте обновить список документов."
          action={
            <Button variant="secondary" icon={<ArrowClockwise weight="bold" />} onClick={() => refetch()}>
              Обновить
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FolderOpen weight="bold" />}
          title={filter === 'all' ? 'Пока нет документов' : 'Нет документов с этим статусом'}
          description={
            filter === 'all'
              ? 'Загрузите PDF или DOCX выше, чтобы они появились здесь и стали доступны для поиска.'
              : 'Измените фильтр или загрузите новые документы.'
          }
        />
      ) : (
        <div className={styles.grid} ref={gridRef}>
          {items.map((doc) => (
            <DocumentCard
              key={doc.id}
              data-card
              doc={doc}
              onDelete={handleDelete}
              deleting={deleteDoc.isPending && deleteDoc.variables === doc.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}
