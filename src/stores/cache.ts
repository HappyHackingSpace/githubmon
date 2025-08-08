// stores/cache.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { GitHubIssue } from '@/types/quickWins'

interface CachedQuickWinsData {
  goodIssues: GitHubIssue[]
  easyFixes: GitHubIssue[]
  timestamp: number
}

interface DataCacheState {
  // Rate limit info
  rateLimitInfo: {
    remaining: number
    limit: number
    resetTime: number
    used: number
  } | null

  // Quick wins cache
  quickWinsCache: CachedQuickWinsData | null

  // Cache actions  
  setRateLimit: (info: DataCacheState['rateLimitInfo']) => void
  setQuickWinsCache: (data: Omit<CachedQuickWinsData, 'timestamp'>) => void
  getQuickWinsCache: () => CachedQuickWinsData | null
  isQuickWinsCacheExpired: () => boolean
  clearQuickWinsCache: () => void
  clearAllCache: () => void
}

export const useDataCacheStore = create<DataCacheState>()(
  persist(
    (set, get) => ({
      rateLimitInfo: null,
      quickWinsCache: null,

      setRateLimit: (rateLimitInfo) => set({ rateLimitInfo }),
      
      setQuickWinsCache: (data) => set({ 
        quickWinsCache: {
          ...data,
          timestamp: Date.now()
        }
      }),
      
      getQuickWinsCache: () => {
        const cache = get().quickWinsCache
        if (!cache || get().isQuickWinsCacheExpired()) {
          return null
        }
        return cache
      },
      
      isQuickWinsCacheExpired: () => {
        const cache = get().quickWinsCache
        if (!cache) return true
        
        const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000 // 12 saat
        const now = Date.now()
        return (now - cache.timestamp) > TWELVE_HOURS_IN_MS
      },
      
      clearQuickWinsCache: () => set({ quickWinsCache: null }),
      
      clearAllCache: () => set({ 
        quickWinsCache: null,
        rateLimitInfo: null 
      })
    }),
    {
      name: 'githubmon-cache',
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

