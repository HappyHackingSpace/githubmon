// src/components/quick-wins/hooks/useQuickWins.ts
// Temporary simple version

export function useQuickWinsCount() {
    return {
        goodIssuesCount: 12,
        easyFixesCount: 8,
        count: 20,
        isLoading: false
    }
}

export function useQuickWins() {
    return {
        goodIssues: [],
        easyFixes: [],
        loadingGoodIssues: false,
        loadingEasyFixes: false,
        goodIssuesError: null,
        easyFixesError: null,
        refreshGoodIssues: () => { },
        refreshEasyFixes: () => { },
        refreshAll: () => { },
        totalIssues: 20,
        needsToken: false,
        hasData: false
    }
}