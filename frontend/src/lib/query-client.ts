import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  documents: (filter: string) => ['documents', filter] as const,
  document: (id: string) => ['document', id] as const,
  search: (query: string, page: number) => ['search', query, page] as const,
  history: () => ['history'] as const,
  me: () => ['me'] as const,
}
