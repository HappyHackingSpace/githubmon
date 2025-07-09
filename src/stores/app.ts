// stores/app.ts
import { create } from 'zustand'

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
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

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

      set((state) => ({
        _notificationTimeouts: new Map(state._notificationTimeouts).set(id, timeoutId)
      }))
    }
  },

  removeNotification: (id) => {
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
    const timeouts = get()._notificationTimeouts
    timeouts.forEach(timeoutId => clearTimeout(timeoutId))

    set({
      notifications: [],
      _notificationTimeouts: new Map()
    })
  }
}))