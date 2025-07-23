// src/components/quick-wins/hooks/useQuickWins.ts
import { useEffect } from 'react'
import { useQuickWinsStore } from '@/stores/quickWins'

interface QuickWinsCount {
    goodIssuesCount: number
    easyFixesCount: number
    count: number
    isLoading: boolean
}

export function useQuickWinsCount(): QuickWinsCount {
    return {
        goodIssuesCount: 12,
        easyFixesCount: 8,
        count: 20,
        isLoading: false
    }
}

export function useQuickWins() {
    const {
        goodIssues,
        easyFixes,
        loading,
        fetchGoodIssues,
        fetchEasyFixes
    } = useQuickWinsStore()

    // Fetch data on mount
    useEffect(() => {
        fetchGoodIssues()
        fetchEasyFixes()
    }, [fetchGoodIssues, fetchEasyFixes])

    const totalIssues = goodIssues.length + easyFixes.length
    const hasData = totalIssues > 0

    return {
        goodIssues,
        easyFixes,
        loadingGoodIssues: loading.goodIssues,
        loadingEasyFixes: loading.easyFixes,
        goodIssuesError: null,
        easyFixesError: null,
        refreshGoodIssues: fetchGoodIssues,
        refreshEasyFixes: fetchEasyFixes,
        refreshAll: () => {
            fetchGoodIssues()
            fetchEasyFixes()
        },
        totalIssues,
        needsToken: false,
        hasData
    }
}
