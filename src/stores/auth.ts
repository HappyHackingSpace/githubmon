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
  validateTokenWithGitHub: () => Promise<boolean>
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

    logout: async () => {
      try {
        // Call logout API to clear server-side cookies
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.warn('Logout API call failed:', error)
        // Continue with client-side cleanup even if API fails
      }
      
      // Clear store state
      set({
        isConnected: false,
        orgData: null,
        tokenExpiry: null
      })
      
      // Clear cookies (client-side)
      cookieUtils.removeAuth()
      
      // Clear localStorage (if any auth data stored there)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('githubmon-auth')
        localStorage.removeItem('auth-token')
        // Clear any other auth-related localStorage items
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('auth') || key.includes('token') || key.includes('githubmon'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      // Force reload to ensure clean state and trigger middleware redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/' // Landing page'e yönlendir
      }
    },

    isTokenValid: () => {
      const { tokenExpiry } = get()
      if (!tokenExpiry) return false
      return new Date(tokenExpiry) > new Date()
    },

    validateTokenWithGitHub: async () => {
      const { orgData } = get()
      if (!orgData?.token) return false

      try {
        const response = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token: orgData.token })
        })

        const result = await response.json()
        return result.valid
      } catch (error) {
        console.error('Token validation failed:', error)
        return false
      }
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
