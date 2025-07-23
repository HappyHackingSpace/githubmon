import { create } from 'zustand'

interface GitHubIssue {
    id: number
    title: string
    url: string
    repository: string
    labels: Array<{ name: string; color: string }>
    createdAt: string
    // Add other relevant GitHub issue properties
}

interface QuickWinsStore {

    goodIssues: GitHubIssue[]
    easyFixes: GitHubIssue[]
    loading: { goodIssues: boolean; easyFixes: boolean }
}
export const useQuickWinsStore = create((set) => ({
    goodIssues: [],
    easyFixes: [],
    loading: { goodIssues: false, easyFixes: false },

    fetchGoodIssues: () => {
        // Mock data for now
        set({ goodIssues: [] })
    },

    fetchEasyFixes: () => {
        // Mock data for now
        set({ easyFixes: [] })
    }
}))