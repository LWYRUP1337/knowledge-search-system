import { create } from 'zustand'

export interface UploadTask {
  clientId: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'error'
  error?: string
}

interface UploadState {
  tasks: UploadTask[]
  add: (task: UploadTask) => void
  update: (clientId: string, patch: Partial<UploadTask>) => void
  remove: (clientId: string) => void
  clearErrors: () => void
}

export const useUploadStore = create<UploadState>((set) => ({
  tasks: [],
  add: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  update: (clientId, patch) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.clientId === clientId ? { ...task, ...patch } : task)),
    })),
  remove: (clientId) => set((state) => ({ tasks: state.tasks.filter((task) => task.clientId !== clientId) })),
  clearErrors: () => set((state) => ({ tasks: state.tasks.filter((task) => task.status !== 'error') })),
}))
