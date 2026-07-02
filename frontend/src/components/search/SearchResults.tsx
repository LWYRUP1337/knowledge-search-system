import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { MagnifyingGlass, SmileySad, WarningOctagon } from '@phosphor-icons/react'
import { ResultCard } from './ResultCard'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useSearch } from '@/hooks/useSearch'
import { plural } from '@/lib/format'
import { cn } from '@/lib/cn'
import styles from './SearchResults.module.css'

export interface SearchResultsProps {
  query: string
  page: number
  onPageChange: (page: number) => void
}

const NO_RESULTS = 'По вашему запросу ничего не найдено. Попробуйте изменить формулировку'

export function SearchResults({ query, page, onPageChange }: SearchResultsProps) {
  
  const { data, isFetching, isError, refetch, isPlaceholderData } = useSearch(query, page)
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!data?.items.length) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-result]', {
          y: 16,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.06,
        })
      })
    },
    { scope: listRef, dependencies: [data?.query, page] },
  )

  const announcement = !query
    ? ''
    : isError
      ? 'Не удалось выполнить поиск'
      : !data
        ? 'Идёт поиск'
        : data.total === 0
          ? 'Ничего не найдено'
          : `Найдено результатов: ${data.total}`

  let body: ReactNode
  if (!query) {
    body = (
      <EmptyState
        icon={<MagnifyingGlass weight="bold" />}
        title="Начните поиск"
        description="Введите запрос, чтобы найти фрагменты в загруженных документах."
      />
    )
  } else if (isError) {
    body = (
      <EmptyState
        tone="danger"
        icon={<WarningOctagon weight="bold" />}
        title="Ошибка поиска"
        description="Не удалось выполнить запрос. Попробуйте ещё раз."
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            Повторить
          </Button>
        }
      />
    )
  } else if (!data) {
    body = (
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height="7.5rem" radius="var(--radius-lg)" />
        ))}
      </div>
    )
  } else if (data.total === 0) {
    body = <EmptyState icon={<SmileySad weight="bold" />} title={NO_RESULTS} />
  } else {
    body = (
      <div className={styles.wrapper}>
        <p className={styles.meta}>
          Найдено <strong>{data.total}</strong>{' '}
          {plural(data.total, 'результат', 'результата', 'результатов')} · за {data.tookMs} мс
        </p>
        <div className={cn(styles.list, isFetching && isPlaceholderData && styles.dim)} ref={listRef}>
          {data.items.map((result) => (

            <ResultCard key={result.id} data-result result={result} query={query} />
          ))}
        </div>
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={onPageChange}
          className={styles.pagination}
        />
      </div>
    )
  }

  return (
    <>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {body}
    </>
  )
}
