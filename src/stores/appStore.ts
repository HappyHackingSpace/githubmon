import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OrgData } from '@/types/auth'
import type { TrendingRepo, TopLanguage, TopContributor } from '@/types/oss-insight'
import { generateUniqueId } from '@/lib/id-generator'

// ============ AUTH STORE ============
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
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
  
      skipHydration: true,
    }
  )
)

// ============ USER PREFERENCES STORE ============
interface UserPreferencesState {
  // Theme (sync with ThemeProvider)
  theme: 'light' | 'dark' | 'system'
  
  // Search preferences
  defaultSearchType: 'all' | 'repos' | 'users'
  searchResultsPerPage: number
  
  // Dashboard preferences
  defaultPeriod: '24h' | '7d' | '30d'
  favoriteLanguages: string[]
  pinnedRepos: string[] // repo full_names
  
  // UI preferences
  sidebarCollapsed: boolean
  compactMode: boolean
  showTutorials: boolean
  
  // Notification preferences
  enableNotifications: boolean
  notifyOnTrends: boolean
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setDefaultSearchType: (type: 'all' | 'repos' | 'users') => void
  setDefaultPeriod: (period: '24h' | '7d' | '30d') => void
  toggleFavoriteLanguage: (language: string) => void
  togglePinnedRepo: (repoFullName: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCompactMode: (compact: boolean) => void
  setShowTutorials: (show: boolean) => void
  setNotifications: (enabled: boolean) => void
  resetPreferences: () => void
}

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

export const usePreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      
      setTheme: (theme) => set({ theme }),
      setDefaultSearchType: (defaultSearchType) => set({ defaultSearchType }),
      setDefaultPeriod: (defaultPeriod) => set({ defaultPeriod }),
      
      toggleFavoriteLanguage: (language) => set((state) => ({
        favoriteLanguages: state.favoriteLanguages.includes(language)
          ? state.favoriteLanguages.filter(l => l !== language)
          : [...state.favoriteLanguages, language]
      })),
      
      togglePinnedRepo: (repoFullName) => set((state) => ({
        pinnedRepos: state.pinnedRepos.includes(repoFullName)
          ? state.pinnedRepos.filter(r => r !== repoFullName)
          : [...state.pinnedRepos, repoFullName]
      })),
      
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setShowTutorials: (showTutorials) => set({ showTutorials }),
      setNotifications: (enableNotifications) => set({ enableNotifications }),
      
      resetPreferences: () => set(defaultPreferences)
    }),
    {
      name: 'githubmon-preferences',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      skipHydration: true,
    }
  )
)

// ============ SEARCH STORE ============
interface SearchState {
  // Search modal state
  isSearchModalOpen: boolean
  
  // Current search
  currentQuery: string
  currentSearchType: 'all' | 'repos' | 'users'
  currentResults: {
    repos: TrendingRepo[]
    users: TopContributor[]
    loading: boolean
    error: string | null
  }
  
  // Search history
  searchHistory: Array<{
    query: string
    type: 'all' | 'repos' | 'users'
    timestamp: number
  }>
  
  // Recent searches (for quick access)
  recentSearches: string[]
  
  // Actions
  setSearchModalOpen: (open: boolean) => void
  setCurrentQuery: (query: string) => void
  setCurrentSearchType: (type: 'all' | 'repos' | 'users') => void
  setSearchResults: (results: SearchState['currentResults']) => void
  addToHistory: (query: string, type: 'all' | 'repos' | 'users') => void
  clearHistory: () => void
  clearRecentSearches: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      isSearchModalOpen: false,
      currentQuery: '',
      currentSearchType: 'all',
      currentResults: {
        repos: [],
        users: [],
        loading: false,
        error: null
      },
      searchHistory: [],
      recentSearches: [],
      
      setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
      setCurrentQuery: (currentQuery) => set({ currentQuery }),
      setCurrentSearchType: (currentSearchType) => set({ currentSearchType }),
      setSearchResults: (currentResults) => set({ currentResults }),
      
      addToHistory: (query, type) => {
        if (!query.trim()) return
        
        set((state) => {
          const newEntry = { query, type, timestamp: Date.now() }
          const filteredHistory = state.searchHistory.filter(h => h.query !== query)
          const newHistory = [newEntry, ...filteredHistory].slice(0, 50)
          
          const newRecent = [query, ...state.recentSearches.filter(r => r !== query)].slice(0, 10)
          
          return {
            searchHistory: newHistory,
            recentSearches: newRecent
          }
        })
      },
      
      clearHistory: () => set({ searchHistory: [] }),
      clearRecentSearches: () => set({ recentSearches: [] })
    }),
    {
      name: 'githubmon-search',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
        currentSearchType: state.currentSearchType
      }),
      skipHydration: true,
    }
  )
)

// ============ DATA CACHE STORE ============
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface DataCacheState {
  // Cached data
  trendingRepos: CacheEntry<TrendingRepo[]> | null
  topLanguages: CacheEntry<TopLanguage[]> | null
  contributors: CacheEntry<TopContributor[]> | null
  
  // Rate limit info
  rateLimitInfo: {
    remaining: number
    limit: number
    resetTime: number
    used: number
  } | null
  
  // Cache actions
  setCachedData: <T>(key: keyof Omit<DataCacheState, 'rateLimitInfo' | 'setCachedData' | 'getCachedData' | 'clearCache' | 'setRateLimit'>, data: T, ttl?: number) => void
  getCachedData: <T>(key: keyof Omit<DataCacheState, 'rateLimitInfo' | 'setCachedData' | 'getCachedData' | 'clearCache' | 'setRateLimit'>) => T | null
  clearCache: () => void
  setRateLimit: (info: DataCacheState['rateLimitInfo']) => void
}

export const useDataCacheStore = create<DataCacheState>()(
  persist(
    (set, get) => ({
      trendingRepos: null,
      topLanguages: null,
      contributors: null,
      rateLimitInfo: null,
      
      setCachedData: (key, data, ttl = 5 * 60 * 1000) => {
        const now = Date.now()
        const entry = {
          data,
          timestamp: now,
          expiresAt: now + ttl
        }
        set({ [key]: entry })
      },
      
      getCachedData: (key) => {
        const entry = get()[key] as CacheEntry<any> | null
        if (!entry) return null
        
        if (Date.now() > entry.expiresAt) {
          set({ [key]: null })
          return null
        }
        
        return entry.data
      },
      
      clearCache: () => set({
        trendingRepos: null,
        topLanguages: null,
        contributors: null
      }),
      
      setRateLimit: (rateLimitInfo) => set({ rateLimitInfo })
    }),
    {
      name: 'githubmon-cache',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      skipHydration: true,
    }
  )
)

// ============ APP STATE STORE (Non-persisted) ============

interface AppState {
  // Loading states
  isLoading: boolean
  loadingMessage: string
  
  // Error states
  globalError: string | null
  
  // UI states
  sidebarOpen: boolean
  
  // Notifications
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: number
    duration?: number
  }>
  
  // Private state for cleanup
  _notificationTimeouts: Map<string, NodeJS.Timeout>
  
  // Actions
  setLoading: (loading: boolean, message?: string) => void
  setGlobalError: (error: string | null) => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}


export const useAppStore = create<AppState>((set, get) => ({
  isLoading: false,
  loadingMessage: '',
  globalError: null,
  sidebarOpen: false,
  notifications: [],
  _notificationTimeouts: new Map(),
  
  setLoading: (isLoading, loadingMessage = '') => set({ isLoading, loadingMessage }),
  setGlobalError: (globalError) => set({ globalError }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  
  addNotification: (notification) => {
    const id = generateUniqueId()
    const newNotification = {
      ...notification,
      id,
      timestamp: Date.now()
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    if (notification.duration !== 0) {
      const timeoutId = setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration || 5000)
      
      // Store the timeout reference for cleanup
      set((state) => ({
        _notificationTimeouts: new Map(state._notificationTimeouts).set(id, timeoutId)
      }))
    }
  },
  
  removeNotification: (id) => {
    // Clear the timeout if it exists
    const timeouts = get()._notificationTimeouts
    const timeoutId = timeouts.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    set((state) => {
      const newTimeouts = new Map(state._notificationTimeouts)
      newTimeouts.delete(id)
      
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        _notificationTimeouts: newTimeouts
      }
    })
  },
  
  clearNotifications: () => {
    // Clear all timeouts
    const timeouts = get()._notificationTimeouts
    timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    
    set({ 
      notifications: [],
      _notificationTimeouts: new Map()
    })
  }
}))

// ============ HYDRATION HOOK ============

import { useEffect, useState } from 'react'

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
export const useAuth = () => {
  const hasHydrated = useStoreHydration()
  const store = useAuthStore()
  
  if (!hasHydrated) {
    return {
      isConnected: false,
      orgData: null,
      tokenExpiry: null,
      setOrgData: () => {},
      setConnected: () => {},
      setTokenExpiry: () => {},
      logout: () => {},
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
      setTheme: () => {},
      setDefaultSearchType: () => {},
      setDefaultPeriod: () => {},
      toggleFavoriteLanguage: () => {},
      togglePinnedRepo: () => {},
      setSidebarCollapsed: () => {},
      setCompactMode: () => {},
      setShowTutorials: () => {},
      setNotifications: () => {},
      resetPreferences: () => {}
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
      setSearchModalOpen: () => {},
      setCurrentQuery: () => {},
      setCurrentSearchType: () => {},
      setSearchResults: () => {},
      addToHistory: () => {},
      clearHistory: () => {},
      clearRecentSearches: () => {}
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
      setCachedData: () => {},
      getCachedData: () => null,
      clearCache: () => {},
      setRateLimit: () => {}
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