// stores/auth.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { OrgData } from '@/types/auth'
import { cookieUtils, type AuthCookieData } from '@/lib/cookies'

interface AuthState {
  isConnected: boolean
  orgData: OrgData | null
  tokenExpiry: string | null
  isHydrated: boolean

  // Actions
  setOrgData: (data: OrgData | null) => void
  setConnected: (connected: boolean) => void
  setTokenExpiry: (expiry: string | null) => void
  logout: () => void
  isTokenValid: () => boolean
  hydrate: () => void
  persistToCookie: () => void
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    isConnected: false,
    orgData: null,
    tokenExpiry: null,
    isHydrated: false,

    setOrgData: (data) => {
      set({ orgData: data })
      get().persistToCookie()
    },

    setConnected: (connected) => {
      set({ isConnected: connected })
      get().persistToCookie()
    },

    setTokenExpiry: (expiry) => {
      set({ tokenExpiry: expiry })
      get().persistToCookie()
    },

    logout: () => {
      set({
        isConnected: false,
        orgData: null,
        tokenExpiry: null
      })
      cookieUtils.removeAuth()
    },

    isTokenValid: () => {
      const { tokenExpiry } = get()
      if (!tokenExpiry) return false
      return new Date(tokenExpiry) > new Date()
    },

    hydrate: () => {
      if (typeof window === 'undefined') return

      const authData = cookieUtils.getAuth()
      if (authData) {
        set({
          isConnected: authData.isConnected,
          orgData: authData.orgData,
          tokenExpiry: authData.tokenExpiry,
          isHydrated: true
        })
      } else {
        set({ isHydrated: true })
      }
    },

    persistToCookie: () => {
      const { isConnected, orgData, tokenExpiry } = get()
      const authData: AuthCookieData = {
        isConnected,
        orgData,
        tokenExpiry
      }
      cookieUtils.setAuth(authData)
    }
  }))
)
