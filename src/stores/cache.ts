// stores/cache.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TrendingRepo, TopLanguage, TopContributor } from '@/types/oss-insight'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface DataCacheState {
  // Cached data
  trendingRepos_24h: CacheEntry<TrendingRepo[]> | null
  trendingRepos_7d: CacheEntry<TrendingRepo[]> | null
  trendingRepos_30d: CacheEntry<TrendingRepo[]> | null
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
  setCachedData: <T>(key: keyof Pick<DataCacheState, 'trendingRepos_24h' | 'trendingRepos_7d' | 'trendingRepos_30d' | 'topLanguages' | 'contributors'>, data: T, ttl?: number) => void
  getCachedData: <T>(key: keyof Pick<DataCacheState, 'trendingRepos_24h' | 'trendingRepos_7d' | 'trendingRepos_30d' | 'topLanguages' | 'contributors'>) => T | null
  clearCache: () => void
    clearExpiredCache: () => void
  setRateLimit: (info: DataCacheState['rateLimitInfo']) => void
}

export const useDataCacheStore = create<DataCacheState>()(
  persist(
    (set, get) => ({
      trendingRepos_24h: null,
      trendingRepos_7d: null,
      trendingRepos_30d: null,
      topLanguages: null,
      contributors: null,
      rateLimitInfo: null,

setCachedData: <T>(key: keyof Pick<DataCacheState, 'trendingRepos_24h' | 'trendingRepos_7d' | 'trendingRepos_30d' | 'topLanguages' | 'contributors'>, data: T, ttl = 5 * 60 * 1000) => {
   const now = Date.now()
   const entry = {
     data,
     timestamp: now,
     expiresAt: now + ttl
   }
   set({ [key]: entry })
 },
      getCachedData: (key) => {
        const state = get()
       const entry = state[key as keyof DataCacheState] as CacheEntry<any> | null
        if (!entry) return null

        if (Date.now() > entry.expiresAt) {
          set({ [key]: null })
          return null
        }

        return entry.data
      },

      clearCache: () => set({
        trendingRepos_24h: null,
        trendingRepos_7d: null,
        trendingRepos_30d: null,
        topLanguages: null,
        contributors: null
      }),

       clearExpiredCache: () => {
        const state = get()
        const now = Date.now()
        const updates: Partial<DataCacheState> = {}
        
        const cacheKeys = ['trendingRepos_24h', 'trendingRepos_7d', 'trendingRepos_30d', 'topLanguages', 'contributors'] as const
        
        cacheKeys.forEach(key => {
          const entry = state[key]
          if (entry && now > entry.expiresAt) {
            updates[key] = null
          }
        })
        
        if (Object.keys(updates).length > 0) {
          set(updates)
        }
      },

      setRateLimit: (rateLimitInfo) => set({ rateLimitInfo })
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

// Automatically clear expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    useDataCacheStore.getState().clearExpiredCache()
  }, 5 * 60 * 1000)
}

