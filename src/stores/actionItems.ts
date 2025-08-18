import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { githubGraphQLClient } from '@/lib/api/github-graphql-client'
import { useAuthStore } from './auth'

export interface ActionItem {
  id: string
  title: string
  repo: string
  type: 'issue' | 'pullRequest'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  url?: string
  createdAt: string
  updatedAt: string
  assignee?: string
  author: string
  daysOld: number
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
  goodFirstIssues: ActionItem[]
  easyFixes: ActionItem[]

  // Loading states
  loading: {
    assigned: boolean
    mentions: boolean
    stale: boolean
    goodFirstIssues: boolean
    easyFixes: boolean
  }

  // Error states
  errors: {
    assigned: string | null
    mentions: string | null
    stale: string | null
    goodFirstIssues: string | null
    easyFixes: string | null
  }

  // Last refresh times
  lastRefresh: {
    assigned: number | null
    mentions: number | null
    stale: number | null
    goodFirstIssues: number | null
    easyFixes: number | null
  }

  // Actions
  setAssignedItems: (items: AssignedItem[]) => void
  setMentionItems: (items: MentionItem[]) => void
  setStaleItems: (items: StalePR[]) => void
  setGoodFirstIssues: (items: ActionItem[]) => void
  setEasyFixes: (items: ActionItem[]) => void

  setLoading: (type: keyof ActionItemsState['loading'], loading: boolean) => void
  setError: (type: keyof ActionItemsState['errors'], error: string | null) => void

  // Computed getters
  getTotalCount: () => number
  getCountByType: (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => number
  getHighPriorityCount: () => number

  // Utility actions
  markAsRead: (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes', id: string) => void
  refreshData: (type?: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => Promise<void>
  clearAll: () => void
}

export const useActionItemsStore = create<ActionItemsState>()(
  persist(
    (set, get) => ({
      // Initial state 
      assignedItems: [],
      mentionItems: [],
      staleItems: [],
      goodFirstIssues: [],
      easyFixes: [],

      loading: {
        assigned: false,
        mentions: false,
        stale: false,
        goodFirstIssues: false,
        easyFixes: false,
      },

      errors: {
        assigned: null,
        mentions: null,
        stale: null,
        goodFirstIssues: null,
        easyFixes: null,
      },

      lastRefresh: {
        assigned: null,
        mentions: null,
        stale: null,
        goodFirstIssues: null,
        easyFixes: null,
      },

      // Actions
      setAssignedItems: (items) => set({ 
        assignedItems: items, 
        lastRefresh: { ...get().lastRefresh, assigned: Date.now() } 
      }),
      
      setMentionItems: (items) => set({ 
        mentionItems: items, 
        lastRefresh: { ...get().lastRefresh, mentions: Date.now() } 
      }),
      
      setStaleItems: (items) => set({ 
        staleItems: items, 
        lastRefresh: { ...get().lastRefresh, stale: Date.now() } 
      }),

      setGoodFirstIssues: (items) => set({ 
        goodFirstIssues: items, 
        lastRefresh: { ...get().lastRefresh, goodFirstIssues: Date.now() } 
      }),
      
      setEasyFixes: (items) => set({ 
        easyFixes: items, 
        lastRefresh: { ...get().lastRefresh, easyFixes: Date.now() } 
      }),

      setLoading: (type, loading) => set((state) => ({ 
        loading: { ...state.loading, [type]: loading } 
      })),
      
      setError: (type, error) => set((state) => ({ 
        errors: { ...state.errors, [type]: error } 
      })),

      getTotalCount: () => {
        const state = get()
        return (
          state.assignedItems.length +
          state.mentionItems.length +
          state.staleItems.length +
          state.goodFirstIssues.length +
          state.easyFixes.length
        )
      },

      getCountByType: (type) => {
        const state = get()
        switch (type) {
          case 'assigned': return state.assignedItems.length
          case 'mentions': return state.mentionItems.length
          case 'stale': return state.staleItems.length
          case 'goodFirstIssues': return state.goodFirstIssues.length
          case 'easyFixes': return state.easyFixes.length
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
        const authState = useAuthStore.getState()
        const userToken = authState.orgData?.token
        const username = authState.orgData?.username

        if (!userToken) {
          console.warn('No GitHub token available for action items')
          const types = type ? [type] : ['assigned', 'mentions', 'stale'] as const
          for (const t of types) {
            set((state) => ({ errors: { ...state.errors, [t]: 'GitHub token required' } }))
          }
          return
        }

        if (!username) {
          console.warn('No GitHub username available for action items')
          const types = type ? [type] : ['assigned', 'mentions', 'stale'] as const
          for (const t of types) {
            set((state) => ({ errors: { ...state.errors, [t]: 'GitHub username required' } }))
          }
          return
        }

        githubGraphQLClient.setToken(userToken)

        if (type) {
          set((state) => ({ 
            loading: { ...state.loading, [type]: true }, 
            errors: { ...state.errors, [type]: null } 
          }))
        } else {
          set(() => ({ 
            loading: { 
              assigned: true, 
              mentions: true, 
              stale: true, 
              goodFirstIssues: true, 
              easyFixes: true 
            },
            errors: { 
              assigned: null, 
              mentions: null, 
              stale: null, 
              goodFirstIssues: null, 
              easyFixes: null 
            }
          }))
        }

        try {
          const actionData = await githubGraphQLClient.getActionRequiredItems(username)

          if (type) {
            switch (type) {
              case 'assigned':
                get().setAssignedItems(actionData.assigned.map(item => ({ 
                  ...item, 
                  assignedAt: item.createdAt 
                })))
                break
              case 'mentions':
                get().setMentionItems(actionData.mentions.map(item => ({ 
                  ...item, 
                  mentionType: item.mentionType || 'mention' as const, 
                  mentionedAt: item.createdAt 
                })))
                break
              case 'stale':
                get().setStaleItems(actionData.stale.map(item => ({ 
                  ...item, 
                  lastActivity: item.updatedAt, 
                  daysStale: item.daysOld, 
                  reviewStatus: 'pending' as const 
                })))
                break
            }
          } else {
            get().setAssignedItems(actionData.assigned.map(item => ({ 
              ...item, 
              assignedAt: item.createdAt 
            })))
            
            get().setMentionItems(actionData.mentions.map(item => ({ 
              ...item, 
              mentionType: item.mentionType || 'mention' as const, 
              mentionedAt: item.createdAt 
            })))
            
            get().setStaleItems(actionData.stale.map(item => ({ 
              ...item, 
              lastActivity: item.updatedAt, 
              daysStale: item.daysOld, 
              reviewStatus: 'pending' as const 
            })))
          }

        } catch (error) {
          console.error('Failed to fetch action items via GraphQL:', error)
          
          if (type) {
            set((state) => ({
              errors: {
                ...state.errors,
                [type]: error instanceof Error ? error.message : 'Failed to load data'
              }
            }))
          } else {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
            set(() => ({
              errors: {
                assigned: errorMessage,
                mentions: errorMessage,
                stale: errorMessage,
                goodFirstIssues: errorMessage,
                easyFixes: errorMessage
              }
            }))
          }
        } finally {
          if (type) {
            set((state) => ({ loading: { ...state.loading, [type]: false } }))
          } else {
            set(() => ({ 
              loading: { 
                assigned: false, 
                mentions: false, 
                stale: false, 
                goodFirstIssues: false, 
                easyFixes: false 
              } 
            }))
          }
        }
      },

      clearAll: () => set({
        assignedItems: [],
        mentionItems: [],
        staleItems: [],
        goodFirstIssues: [],
        easyFixes: [],
        errors: {
          assigned: null,
          mentions: null,
          stale: null,
          goodFirstIssues: null,
          easyFixes: null,
        },
        lastRefresh: {
          assigned: null,
          mentions: null,
          stale: null,
          goodFirstIssues: null,
          easyFixes: null,
        }
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