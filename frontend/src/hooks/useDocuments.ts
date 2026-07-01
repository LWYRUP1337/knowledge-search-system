import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteDocument, listDocuments, uploadDocument } from '@/api/documents'
import { queryKeys } from '@/lib/query-client'
import { useUploadStore } from '@/store/upload-store'
import type { DocumentDto, DocumentStatusFilter, Paginated } from '@/types/api'

const TRICKLE_INTERVAL_MS = 180
const TRICKLE_CEILING = 90

export function useDocuments(filter: DocumentStatusFilter = 'all') {
  return useQuery({
    queryKey: queryKeys.documents(filter),
    queryFn: () => listDocuments({ status: filter, size: 200 }),
    refetchInterval: (query) => {
      const data = query.state.data as Paginated<DocumentDto> | undefined
      const processing = data?.items.some(
        (doc) => doc.status === 'indexing' || doc.status === 'queued',
      )
      return processing ? 800 : false
    },
  })
}

export function useUploadDocuments() {
  const queryClient = useQueryClient()
  const addTask = useUploadStore((state) => state.add)
  const updateTask = useUploadStore((state) => state.update)
  const removeTask = useUploadStore((state) => state.remove)

  return useCallback(
    (files: File[]) => {
      for (const file of files) {
        const clientId = crypto.randomUUID()
        addTask({ clientId, name: file.name, size: file.size, progress: 0, status: 'uploading' })

        let trickle = 0
        const timer = window.setInterval(() => {
          trickle = Math.min(TRICKLE_CEILING, trickle + Math.random() * 18)
          updateTask(clientId, { progress: Math.round(trickle) })
        }, TRICKLE_INTERVAL_MS)

        uploadDocument(file, {
          onProgress: (real) => {
            trickle = Math.max(trickle, real)
            updateTask(clientId, { progress: Math.round(trickle) })
          },
        })
          .then(() => {
            window.clearInterval(timer)
            updateTask(clientId, { progress: 100 })
            window.setTimeout(() => removeTask(clientId), 350)
            void queryClient.invalidateQueries({ queryKey: ['documents'] })
          })
          .catch((error: unknown) => {
            window.clearInterval(timer)
            const message = error instanceof Error ? error.message : 'Не удалось загрузить файл'
            if (message.includes('отменена')) {
              removeTask(clientId)
              return
            }
            updateTask(clientId, { status: 'error', error: message })
          })
      }
    },
    [addTask, updateTask, removeTask, queryClient],
  )
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}
