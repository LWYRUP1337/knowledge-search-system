import { PageHeader } from '@/components/ui/PageHeader'
import { HistoryList } from '@/components/history/HistoryList'
import styles from './page.module.css'

export default function HistoryPage() {
  return (
    <div className={styles.stack}>
      <PageHeader title="История поиска" subtitle="Недавние запросы. Нажмите на запрос, чтобы повторить поиск." />
      <HistoryList />
    </div>
  )
}
