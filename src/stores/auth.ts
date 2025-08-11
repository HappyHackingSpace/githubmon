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

logout: async () => {
  // Clear state first
  set({
    isConnected: false,
    orgData: null,
    tokenExpiry: null
  })
  
  // Clear cookie
  cookieUtils.removeAuth()
  
  try {
    // Call logout endpoint
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    console.warn('Logout endpoint failed:', error)
  }
  
  // Redirect to home page
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
},

checkCookieSync: () => {
  const { isConnected, orgData } = get()
  const cookieData = cookieUtils.getAuth()
  
  if (!cookieData && isConnected) {
    set({
      isConnected: false,
      orgData: null,
      tokenExpiry: null
    })
    return false
  }
  
  if (cookieData && !isConnected) {
    set({
      isConnected: cookieData.isConnected,
      orgData: cookieData.orgData,
      tokenExpiry: cookieData.tokenExpiry
    })
    return true
  }
  
  return isConnected
},

    isTokenValid: () => {
      const { tokenExpiry } = get()
      if (!tokenExpiry) return false
      return new Date(tokenExpiry) > new Date()
    },

    hydrate: () => {
  if (typeof window === 'undefined') {
    set({ isHydrated: true })
    return
  }

  const authData = cookieUtils.getAuth()
  if (authData && authData.tokenExpiry) {
    const isExpired = new Date() >= new Date(authData.tokenExpiry)
    
    if (!isExpired) {
      // Migration: eski orgData yapısı varsa username ekle
      let migratedOrgData = authData.orgData
      if (migratedOrgData && !migratedOrgData.username) {
        // Eski format: sadece orgName ve token var
        migratedOrgData = {
          ...migratedOrgData,
          username: migratedOrgData.orgName // fallback olarak orgName kullan
        }
        // Güncellenmiş veriyi cookie'ye kaydet
        const updatedAuthData = { ...authData, orgData: migratedOrgData }
        cookieUtils.setAuth(updatedAuthData)
      }
      
      set({
        isConnected: authData.isConnected,
        orgData: migratedOrgData,
        tokenExpiry: authData.tokenExpiry,
        isHydrated: true
      })
    } else {
      cookieUtils.removeAuth()
      set({ 
        isConnected: false,
        orgData: null,
        tokenExpiry: null,
        isHydrated: true 
      })
    }
  } else {
    set({ 
      isConnected: false,
      orgData: null,
      tokenExpiry: null,
      isHydrated: true 
    })
  }
},

initCookieSync: () => {
  if (typeof window === 'undefined') return
  
  const checkCookie = () => {
    const cookieData = cookieUtils.getAuth()
    const { isConnected } = get()
    
    if (!cookieData && isConnected) {
      get().logout()
    }
  }
  
  const interval = setInterval(checkCookie, 1000)
  
  return () => clearInterval(interval)
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
