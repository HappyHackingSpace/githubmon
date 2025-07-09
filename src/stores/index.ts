// stores/index.ts
import { useEffect, useState } from 'react'
import { useAuthStore } from './auth'
import { usePreferencesStore } from './preferences'
import { useSearchStore } from './search'
import { useDataCacheStore } from './cache'
import { useAppStore } from './app'


// Re-export all stores
export { useAuthStore } from './auth'
export { usePreferencesStore } from './preferences'
export { useSearchStore } from './search'
export { useDataCacheStore } from './cache'
export { useAppStore } from './app'
// ============ HYDRATION HOOK ============
export const useStoreHydration = () => {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    useAuthStore.persist.rehydrate()
    usePreferencesStore.persist.rehydrate()
    useSearchStore.persist.rehydrate()
    useDataCacheStore.persist.rehydrate()

    setHasHydrated(true)
  }, [])

  return hasHydrated
}

// ============ SAFE SELECTORS (SSR-friendly) ============
const defaultPreferences = {
  theme: 'system' as const,
  defaultSearchType: 'all' as const,
  searchResultsPerPage: 20,
  defaultPeriod: '24h' as const,
  favoriteLanguages: [],
  pinnedRepos: [],
  sidebarCollapsed: false,
  compactMode: false,
  showTutorials: true,
  enableNotifications: true,
  notifyOnTrends: false
}

export const useAuth = () => {
  const hasHydrated = useStoreHydration()
  const store = useAuthStore()

  if (!hasHydrated) {
    return {
      isConnected: false,
      orgData: null,
      tokenExpiry: null,
      setOrgData: () => { },
      setConnected: () => { },
      setTokenExpiry: () => { },
      logout: () => { },
      isTokenValid: () => false
    }
  }

  return store
}

export const usePreferences = () => {
  const hasHydrated = useStoreHydration()
  const store = usePreferencesStore()

  if (!hasHydrated) {
    return {
      ...defaultPreferences,
      setTheme: () => { },
      setDefaultSearchType: () => { },
      setDefaultPeriod: () => { },
      toggleFavoriteLanguage: () => { },
      togglePinnedRepo: () => { },
      setSidebarCollapsed: () => { },
      setCompactMode: () => { },
      setShowTutorials: () => { },
      setNotifications: () => { },
      resetPreferences: () => { }
    }
  }

  return store
}

export const useSearch = () => {
  const hasHydrated = useStoreHydration()
  const store = useSearchStore()

  if (!hasHydrated) {
    return {
      isSearchModalOpen: false,
      currentQuery: '',
      currentSearchType: 'all' as const,
      currentResults: { repos: [], users: [], loading: false, error: null },
      searchHistory: [],
      recentSearches: [],
      setSearchModalOpen: () => { },
      setCurrentQuery: () => { },
      setCurrentSearchType: () => { },
      setSearchResults: () => { },
      addToHistory: () => { },
      clearHistory: () => { },
      clearRecentSearches: () => { }
    }
  }

  return store
}

export const useDataCache = () => {
  const hasHydrated = useStoreHydration()
  const store = useDataCacheStore()

  if (!hasHydrated) {
    return {
      trendingRepos: null,
      topLanguages: null,
      contributors: null,
      rateLimitInfo: null,
      setCachedData: () => { },
      getCachedData: () => null,
      clearCache: () => { },
      setRateLimit: () => { }
    }
  }

  return store
}

export const useApp = () => useAppStore()

// Specific selectors
export const useIsAuthenticated = () => {
  const { isConnected, orgData, isTokenValid } = useAuth()
  return isConnected && orgData?.token && isTokenValid()
}

export const useTheme = () => {
  const { theme } = usePreferences()
  return theme
}

export const useSidebarState = () => {
  const isOpen = useAppStore(state => state.sidebarOpen)
  const setOpen = useAppStore(state => state.setSidebarOpen)
  return { isOpen, setOpen }
}

export const useNotifications = () => {
  const notifications = useAppStore(state => state.notifications)
  const add = useAppStore(state => state.addNotification)
  const remove = useAppStore(state => state.removeNotification)
  const clear = useAppStore(state => state.clearNotifications)
  return { notifications, add, remove, clear }
}