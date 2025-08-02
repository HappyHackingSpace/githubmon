// stores/actionItems.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { githubAPIClient } from '@/lib/api/github-api-client'
import { useAuthStore } from './auth'

export interface ActionItem {
  id: number
  title: string
  repo: string
  type: 'issue' | 'pr'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  url?: string
  createdAt: string
  updatedAt: string
  assignee?: string
  author?: string
  labels?: string[]
  daysOld?: number
}

export interface AssignedItem extends ActionItem {
  assignedAt: string
}

export interface MentionItem extends ActionItem {
  mentionType: 'mention' | 'review_request' | 'comment'
  mentionedAt: string
}

export interface StalePR extends ActionItem {
  lastActivity: string
  daysStale: number
  reviewStatus: 'pending' | 'approved' | 'changes_requested'
}

interface ActionItemsState {
  // Data
  assignedItems: AssignedItem[]
  mentionItems: MentionItem[]
  staleItems: StalePR[]
  
  // Loading states
  loading: {
    assigned: boolean
    mentions: boolean
    stale: boolean
  }
  
  // Error states
  errors: {
    assigned: string | null
    mentions: string | null
    stale: string | null
  }
  
  // Last refresh times
  lastRefresh: {
    assigned: number | null
    mentions: number | null
    stale: number | null
  }
  
  // Actions
  setAssignedItems: (items: AssignedItem[]) => void
  setMentionItems: (items: MentionItem[]) => void
  setStaleItems: (items: StalePR[]) => void
  
  setLoading: (type: keyof ActionItemsState['loading'], loading: boolean) => void
  setError: (type: keyof ActionItemsState['errors'], error: string | null) => void
  
  // Computed getters
  getTotalCount: () => number
  getCountByType: (type: 'assigned' | 'mentions' | 'stale') => number
  getHighPriorityCount: () => number
  
  // Utility actions
  markAsRead: (type: 'assigned' | 'mentions' | 'stale', id: number) => void
  refreshData: (type?: 'assigned' | 'mentions' | 'stale') => Promise<void>
  clearAll: () => void
}

export const useActionItemsStore = create<ActionItemsState>()(
  persist(
    (set, get) => ({
      // Initial state
      assignedItems: [],
      mentionItems: [],
      staleItems: [],
      
      loading: {
        assigned: false,
        mentions: false,
        stale: false
      },
      
      errors: {
        assigned: null,
        mentions: null,
        stale: null
      },
      
      lastRefresh: {
        assigned: null,
        mentions: null,
        stale: null
      },
      
      // Actions
      setAssignedItems: (items) => set({ assignedItems: items, lastRefresh: { ...get().lastRefresh, assigned: Date.now() } }),
      setMentionItems: (items) => set({ mentionItems: items, lastRefresh: { ...get().lastRefresh, mentions: Date.now() } }),
      setStaleItems: (items) => set({ staleItems: items, lastRefresh: { ...get().lastRefresh, stale: Date.now() } }),
      
      setLoading: (type, loading) => set((state) => ({ loading: { ...state.loading, [type]: loading } })),
      setError: (type, error) => set((state) => ({ errors: { ...state.errors, [type]: error } })),
      
      // Computed getters
      getTotalCount: () => {
        const state = get()
        return state.assignedItems.length + state.mentionItems.length + state.staleItems.length
      },
      
      getCountByType: (type) => {
        const state = get()
        switch (type) {
          case 'assigned': return state.assignedItems.length
          case 'mentions': return state.mentionItems.length
          case 'stale': return state.staleItems.length
          default: return 0
        }
      },
      
      getHighPriorityCount: () => {
        const state = get()
        return [
          ...state.assignedItems,
          ...state.mentionItems,
          ...state.staleItems
        ].filter(item => item.priority === 'high' || item.priority === 'urgent').length
      },
      
      // Utility actions
      markAsRead: (type, id) => {
        set((state) => {
          switch (type) {
            case 'assigned':
              return { assignedItems: state.assignedItems.filter(item => item.id !== id) }
            case 'mentions':
              return { mentionItems: state.mentionItems.filter(item => item.id !== id) }
            case 'stale':
              return { staleItems: state.staleItems.filter(item => item.id !== id) }
            default:
              return state
          }
        })
      },
      
      refreshData: async (type) => {
        // Get user token from auth store
        const authState = useAuthStore.getState()
        const userToken = authState.orgData?.token
        const username = authState.orgData?.orgName
        
        if (!userToken) {
          console.warn('No GitHub token available for action items')
          const types = type ? [type] : ['assigned', 'mentions', 'stale'] as const
          for (const t of types) {
            set((state) => ({ errors: { ...state.errors, [t]: 'GitHub token required' } }))
          }
          return
        }
        
        // Set the user token in the API client
        githubAPIClient.setUserToken(userToken)
        
        const types = type ? [type] : ['assigned', 'mentions', 'stale'] as const
        
        for (const t of types) {
          set((state) => ({ loading: { ...state.loading, [t]: true }, errors: { ...state.errors, [t]: null } }))
          
          try {
            let items: any[] = []
            
            switch (t) {
              case 'assigned':
                items = await githubAPIClient.getAssignedItems(username)
                get().setAssignedItems(items.map(item => ({ ...item, assignedAt: item.assignedAt || item.createdAt })))
                break
              case 'mentions':
                items = await githubAPIClient.getMentionItems(username)
                get().setMentionItems(items.map(item => ({ 
                  ...item, 
                  mentionType: item.mentionType || 'mention',
                  mentionedAt: item.mentionedAt || item.updatedAt 
                })))
                break
              case 'stale':
                items = await githubAPIClient.getStaleItems(username)
                get().setStaleItems(items.map(item => ({ 
                  ...item, 
                  lastActivity: item.lastActivity || item.updatedAt,
                  daysStale: item.daysStale || item.daysOld || 0,
                  reviewStatus: item.reviewStatus || 'pending'
                })))
                break
            }
            
            console.log(`Loaded ${items.length} ${t} items from GitHub API`)
          } catch (error) {
            console.error(`Failed to fetch ${t} items:`, error)
            set((state) => ({ 
              errors: { 
                ...state.errors, 
                [t]: error instanceof Error ? error.message : 'Failed to load data' 
              } 
            }))
          } finally {
            set((state) => ({ loading: { ...state.loading, [t]: false } }))
          }
        }
      },
      
      clearAll: () => set({
        assignedItems: [],
        mentionItems: [],
        staleItems: [],
        errors: { assigned: null, mentions: null, stale: null },
        lastRefresh: { assigned: null, mentions: null, stale: null }
      })
    }),
    {
      name: 'githubmon-action-items',
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
      partialize: (state) => ({
        assignedItems: state.assignedItems,
        mentionItems: state.mentionItems,
        staleItems: state.staleItems,
        lastRefresh: state.lastRefresh
      }),
    }
  )
)
