import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import styles from './page.module.css'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  const handleSearch = (next: string) => {
    const nextParams = new URLSearchParams()
    if (next) nextParams.set('q', next)
    setParams(nextParams)
  }

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('page', String(nextPage))
    setParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Поиск по документам"
        subtitle="Полнотекстовый поиск с ранжированием результатов и подсветкой совпадений."
      />
      <SearchBar key={query} initialValue={query} onSearch={handleSearch} autoFocus />
      <SearchResults query={query} page={page} onPageChange={handlePageChange} />
    </div>
  )
}
