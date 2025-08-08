
import { useEffect, useCallback, useRef } from 'react'
import { useQuickWinsStore } from '@/stores/quickWins'
import { useDataCacheStore } from '@/stores/cache'
import { useActionItemsStore } from '@/stores'
import { githubAPIClient } from '@/lib/api/github-api-client'


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
        error,
        fetchGoodIssues,
        fetchEasyFixes,
        loadFromCache
    } = useQuickWinsStore()

    const { isQuickWinsCacheExpired } = useDataCacheStore()
    const { setGoodFirstIssues, setEasyFixes } = useActionItemsStore()

    const isInitialized = useRef(false)

    const initializeData = useCallback(async () => {
        if (isInitialized.current) return
        loadFromCache()
        const { goodIssues: gi, easyFixes: ef } = useQuickWinsStore.getState()
        const needsFetch = isQuickWinsCacheExpired() || (gi.length === 0 && ef.length === 0)
        if (needsFetch) {
            await Promise.all([
                fetchGoodIssues(false),
                fetchEasyFixes(false)
            ])
        }
        isInitialized.current = true
    }, [loadFromCache, isQuickWinsCacheExpired, goodIssues.length, easyFixes.length, fetchGoodIssues, fetchEasyFixes])

    useEffect(() => {
        if (goodIssues.length > 0) {
            setGoodFirstIssues(goodIssues.map(issue => ({
                id: issue.id,
                title: issue.title,
                repo: issue.repository,
                type: 'issue' as const,
                priority: issue.priority,
                url: issue.url,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                author: issue.author.login,
                labels: issue.labels.map(l => l.name)
            })))
        }
    }, [goodIssues, setGoodFirstIssues])

    useEffect(() => {
        if (easyFixes.length > 0) {
            setEasyFixes(easyFixes.map(issue => ({
                id: issue.id,
                title: issue.title,
                repo: issue.repository,
                type: 'issue' as const,
                priority: issue.priority,
                url: issue.url,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                author: issue.author.login,
                labels: issue.labels.map(l => l.name)
            })))
        }
    }, [easyFixes, setEasyFixes])

    useEffect(() => {

        // Load from cache first
        loadFromCache()

        // Then check if we need to fetch fresh data
        if (isQuickWinsCacheExpired()) {
            fetchGoodIssues()
            fetchEasyFixes()
        }
    }, [loadFromCache, isQuickWinsCacheExpired, fetchGoodIssues, fetchEasyFixes])


    const totalIssues = goodIssues.length + easyFixes.length
    const needsToken = !githubAPIClient.hasValidToken()
    const hasData = totalIssues > 0

    // Create refresh functions
    const refreshGoodIssues = () => fetchGoodIssues(true)
    const refreshEasyFixes = () => fetchEasyFixes(true)

    return {
        goodIssues,
        easyFixes,
        loading,
        totalIssues,
        needsToken,
        hasData,
        // Individual loading states for compatibility
        loadingGoodIssues: loading.goodIssues,
        loadingEasyFixes: loading.easyFixes,

        // Individual error states
        goodIssuesError: error.goodIssues,
        easyFixesError: error.easyFixes,
        // Refresh functions
        refreshGoodIssues,
        refreshEasyFixes

    }
}
