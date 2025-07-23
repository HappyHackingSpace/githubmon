import { create } from 'zustand'

interface QuickWinsStore {
    goodIssues: any[]
    easyFixes: any[]
    loading: { goodIssues: boolean; easyFixes: boolean }

    // Mock actions
    fetchGoodIssues: () => void
    fetchEasyFixes: () => void
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