import { create } from 'zustand'

export const useQuickWinsStore = create((set) => ({
    goodIssues: [],
    easyFixes: [],
    loading: { goodIssues: false, easyFixes: false },

    fetchGoodIssues: () => {

        set({ goodIssues: [] })
    },

    fetchEasyFixes: () => {

        set({ easyFixes: [] })
    }
}))