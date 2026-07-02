import { X } from '@phosphor-icons/react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { IconButton } from '@/components/ui/IconButton'
import { useUploadStore } from '@/store/upload-store'
import { formatBytes } from '@/lib/format'
import styles from './UploadQueue.module.css'

export function UploadQueue() {
  const tasks = useUploadStore((state) => state.tasks)
  const remove = useUploadStore((state) => state.remove)

  if (tasks.length === 0) return null

  return (
    <ul className={styles.list} aria-label="Текущие загрузки">
      {tasks.map((task) => (
        <li key={task.clientId} className={styles.item}>
          <div className={styles.head}>
            <span className={styles.name} title={task.name}>
              {task.name}
            </span>
            <StatusBadge status={task.status === 'error' ? 'error' : 'uploading'} />
            <IconButton label="Убрать из списка" size="sm" onClick={() => remove(task.clientId)}>
              <X weight="bold" />
            </IconButton>
          </div>

          {task.status === 'uploading' ? (
            <>
              <ProgressBar value={task.progress} label={`Загрузка ${task.name}`} />
              <span className={styles.meta}>
                {formatBytes(task.size)} · {task.progress}%
              </span>
            </>
          ) : (
            <p className={styles.error}>{task.error}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
