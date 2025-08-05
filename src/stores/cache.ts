// stores/cache.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface DataCacheState {
  // Rate limit info
  rateLimitInfo: {
    remaining: number
    limit: number
    resetTime: number
    used: number
  } | null

  // Cache actions  
  setRateLimit: (info: DataCacheState['rateLimitInfo']) => void
}

export const useDataCacheStore = create<DataCacheState>()(
  persist(
    (set) => ({
      rateLimitInfo: null,
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

