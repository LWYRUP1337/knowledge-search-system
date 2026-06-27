import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/api'

export type ThemePreference = 'light' | 'dark' | 'system'

interface AppState {
  token: string | null
  user: User | null
  theme: ThemePreference
  setSession: (token: string, user: User) => void
  clearSession: () => void
  setTheme: (theme: ThemePreference) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      theme: 'system',
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'svetik-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, theme: state.theme }),
    },
  ),
)
