import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface GitHubSettings {
  repositories: string[] 
  labels: string[] 
  assignedToMe: boolean
  mentionsMe: boolean
  authoredByMe: boolean
  reviewRequestedFromMe: boolean
  stalePRDays: number 
}

interface SettingsState {
  githubSettings: GitHubSettings
  updateGitHubSettings: (settings: Partial<GitHubSettings>) => void
  resetSettings: () => void
}

const defaultSettings: GitHubSettings = {
  repositories: [],
  labels: [], // No default labels
  assignedToMe: true,
  mentionsMe: true,
  authoredByMe: false,
  reviewRequestedFromMe: true,
  stalePRDays: 7
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      githubSettings: defaultSettings,
      updateGitHubSettings: (settings) => 
        set((state) => ({
          githubSettings: { ...state.githubSettings, ...settings }
        })),
      resetSettings: () => set({ githubSettings: defaultSettings })
    }),
    {
      name: 'githubmon-settings',
      storage: createJSONStorage(() => localStorage)
    }
  )
)