import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clearHistory, deleteHistoryItem, getHistory } from '@/api/search'
import { queryKeys } from '@/lib/query-client'

export function useHistory() {
  return useQuery({
    queryKey: queryKeys.history(),
    queryFn: () => getHistory(50),
  })
}

export function useDeleteHistoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.history() }),
  })
}

export function useClearHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.history() }),
  })
}
