
import { useEffect } from 'react'
import { useQuickWinsStore } from '@/stores/quickWins'
import { useDataCacheStore } from '@/stores/cache'
import { useActionItemsStore } from '@/stores'
import { githubGraphQLClient } from '@/lib/api/github-graphql-client'


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
        fetchEasyFixes,
        loadFromCache
    } = useQuickWinsStore()

    const { isQuickWinsCacheExpired } = useDataCacheStore()
    const { setGoodFirstIssues, setEasyFixes } = useActionItemsStore()

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
        
        loadFromCache()
        
        if (isQuickWinsCacheExpired()) { 
            fetchGoodIssues(true)
            fetchEasyFixes(true)
        } 
    }, [loadFromCache, isQuickWinsCacheExpired, fetchGoodIssues, fetchEasyFixes])

    const totalIssues = goodIssues.length + easyFixes.length
    const hasData = totalIssues > 0

    return {
        goodIssues,
        easyFixes,
        loadingGoodIssues: loading.goodIssues,
        loadingEasyFixes: loading.easyFixes,
        goodIssuesError: null,
        easyFixesError: null,
        refreshGoodIssues: () => fetchGoodIssues(true),
        refreshEasyFixes: () => fetchEasyFixes(true),
        refreshAll: async () => {
            await Promise.all([
                fetchGoodIssues(true),
                fetchEasyFixes(true)
            ]);
        },
        totalIssues,
        needsToken: false,
        hasData
    }
}
