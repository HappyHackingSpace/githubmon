// stores/auth.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OrgData } from '@/types/auth'

interface AuthState {
  isConnected: boolean
  orgData: OrgData | null
  tokenExpiry: string | null

  // Actions
  setOrgData: (data: OrgData | null) => void
  setConnected: (connected: boolean) => void
  setTokenExpiry: (expiry: string | null) => void
  logout: () => void
  isTokenValid: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      orgData: null,
      tokenExpiry: null,

      setOrgData: (data) => set({ orgData: data }),
      setConnected: (connected) => set({ isConnected: connected }),
      setTokenExpiry: (expiry) => set({ tokenExpiry: expiry }),

      logout: () => set({
        isConnected: false,
        orgData: null,
        tokenExpiry: null
      }),

      isTokenValid: () => {
        const { tokenExpiry } = get()
        if (!tokenExpiry) return false
        return new Date(tokenExpiry) > new Date()
      }
    }),
    {
      name: 'githubmon-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          }
        }
        return localStorage
      }),
      skipHydration: true,
    }
  )
)
