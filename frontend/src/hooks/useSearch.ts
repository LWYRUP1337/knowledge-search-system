import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { search } from '@/api/search'
import { SEARCH_PAGE_SIZE } from '@/lib/constants'
import { queryKeys } from '@/lib/query-client'

export function useSearch(query: string, page: number) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: queryKeys.search(trimmed, page),
    queryFn: () => search({ q: trimmed, page, size: SEARCH_PAGE_SIZE }),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
