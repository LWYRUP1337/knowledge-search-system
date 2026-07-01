import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClockCounterClockwise, MagnifyingGlass, Trash, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useClearHistory, useDeleteHistoryItem, useHistory } from '@/hooks/useHistory'
import { formatRelative, plural } from '@/lib/format'
import styles from './HistoryList.module.css'

export function HistoryList() {
  const { data, isPending, isError, refetch } = useHistory()
  const deleteItem = useDeleteHistoryItem()
  const clear = useClearHistory()
  const navigate = useNavigate()

  const runSearch = (query: string) => navigate(`/search?q=${encodeURIComponent(query)}`)

  if (isPending) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height="3.5rem" radius="var(--radius)" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        tone="danger"
        title="Не удалось загрузить историю"
        description="Попробуйте обновить страницу."
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            Обновить
          </Button>
        }
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<ClockCounterClockwise weight="bold" />}
        title="История пуста"
        description="Здесь появятся ваши поисковые запросы."
      />
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {data.length} {plural(data.length, 'запрос', 'запроса', 'запросов')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash weight="bold" />}
          onClick={() => clear.mutate(undefined, { onSuccess: () => toast.success('История очищена') })}
          disabled={clear.isPending}
        >
          Очистить всё
        </Button>
      </div>

      <ul className={styles.list}>
        {data.map((item) => (
          <li key={item.id} className={styles.item}>
            <button
              type="button"
              className={styles.query}
              aria-label={`Повторить поиск «${item.query}»`}
              onClick={() => runSearch(item.query)}
            >
              <MagnifyingGlass weight="bold" className={styles.queryIcon} aria-hidden />
              <span className={styles.queryText}>{item.query}</span>
            </button>
            <span className={styles.resultsCount}>
              {item.resultsCount} {plural(item.resultsCount, 'результат', 'результата', 'результатов')}
            </span>
            <span className={styles.time}>{formatRelative(item.createdAt)}</span>
            <IconButton
              label={`Удалить запрос «${item.query}»`}
              size="sm"
              onClick={() => deleteItem.mutate(item.id)}
            >
              <X weight="bold" />
            </IconButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
