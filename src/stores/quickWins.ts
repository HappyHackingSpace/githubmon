import { create } from 'zustand'
import { GitHubIssue } from '@/types/quickWins'
import { githubAPIClient, type MappedIssue } from '@/lib/api/github-api-client';
import { useDataCacheStore } from './cache'

interface QuickWinsState {
    goodIssues: GitHubIssue[]
    easyFixes: GitHubIssue[]
    loading: {
        goodIssues: boolean
        easyFixes: boolean
    }
    error: {
        goodIssues: string | null
        easyFixes: string | null
    }
    fetchGoodIssues: (forceRefresh?: boolean) => Promise<void>
    fetchEasyFixes: (forceRefresh?: boolean) => Promise<void>
    loadFromCache: () => void
}

export const useQuickWinsStore = create<QuickWinsState>((set, get) => ({
    goodIssues: [],
    easyFixes: [],
    loading: { goodIssues: false, easyFixes: false },
    error: { goodIssues: null, easyFixes: null },

    loadFromCache: () => {
        const cache = useDataCacheStore.getState().getQuickWinsCache()
        if (cache) {
          
            set({
                goodIssues: cache.goodIssues,
                easyFixes: cache.easyFixes
            })
        }
    },

    fetchGoodIssues: async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cache = useDataCacheStore.getState().getQuickWinsCache()
            if (cache) {
                
                set((state) => ({
                    goodIssues: cache.goodIssues,
                    error: { ...state.error, goodIssues: null }
                }))
                return
            }
        }

        set((state) => ({
            loading: { ...state.loading, goodIssues: true },
            error: { ...state.error, goodIssues: null }
        }));

        try {
            const issues = await githubAPIClient.getGoodFirstIssues();
            
            const formattedIssues: GitHubIssue[] = issues.map((typedItem: MappedIssue) => {
                const formatted = {
                    id: typedItem.id,
                    title: typedItem.title,
                    repository: typedItem.repo,
                    repositoryUrl: `https://github.com/${typedItem.repo}`,
                    url: typedItem.url || '',
                    labels: (typedItem.labels || []).map((name: string) => ({ name, color: '999999' })),
                    created_at: typedItem.createdAt || '',
                    updated_at: typedItem.updatedAt || '',
                    difficulty: 'easy' as const,
                    language: typedItem.language || 'unknown',
                    stars: typedItem.stars || 0,
                    author: { login: typedItem.author || '', avatar_url: '' },
                    comments: 0,
                    state: 'open' as const,
                    assignee: null,
                    priority: (typedItem.priority === 'urgent' ? 'high' : typedItem.priority) as 'low' | 'medium' | 'high',
                };
               
                return formatted;
            });

            set((state) => ({
                goodIssues: formattedIssues,
                loading: { ...state.loading, goodIssues: false },
                error: { ...state.error, goodIssues: null }
            }));
            
            const currentEasyFixes = get().easyFixes
            useDataCacheStore.getState().setQuickWinsCache({
                goodIssues: formattedIssues,
                easyFixes: currentEasyFixes
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            set((state) => ({
                goodIssues: [],
                loading: { ...state.loading, goodIssues: false },
                error: { ...state.error, goodIssues: errorMessage }
            }));
        }
    },

    fetchEasyFixes: async (forceRefresh = false) => {
       
        if (!forceRefresh) {
            const cache = useDataCacheStore.getState().getQuickWinsCache()
            if (cache) {
               
                set((state) => ({
                    easyFixes: cache.easyFixes,
                    error: { ...state.error, easyFixes: null }
                }))
                return
            }
        }

        set((state) => ({
            loading: { ...state.loading, easyFixes: true },
            error: { ...state.error, easyFixes: null }
        }));

        try {
            const issues = await githubAPIClient.getEasyFixes();
            
            const formattedIssues: GitHubIssue[] = issues.map((typedItem: MappedIssue) => {
                const formatted = {
                    id: typedItem.id,
                    title: typedItem.title,
                    repository: typedItem.repo,
                    repositoryUrl: `https://github.com/${typedItem.repo}`,
                    url: typedItem.url || '',
                    labels: (typedItem.labels || []).map((name: string) => ({ name, color: '999999' })),
                    created_at: typedItem.createdAt || '',
                    updated_at: typedItem.updatedAt || '',
                    difficulty: 'easy' as const,
                    language: typedItem.language || 'unknown',
                    stars: typedItem.stars || 0,
                    author: { login: typedItem.author || '', avatar_url: '' },
                    comments: 0,
                    state: 'open' as const,
                    assignee: null,
                    priority: (typedItem.priority === 'urgent' ? 'high' : typedItem.priority) as 'low' | 'medium' | 'high',
                };
               
                return formatted;
            });

            set((state) => ({
                easyFixes: formattedIssues,
                loading: { ...state.loading, easyFixes: false },
                error: { ...state.error, easyFixes: null }
            }));
            
            const currentGoodIssues = get().goodIssues
            useDataCacheStore.getState().setQuickWinsCache({
                goodIssues: currentGoodIssues,
                easyFixes: formattedIssues
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            set((state) => ({
                easyFixes: [],
                loading: { ...state.loading, easyFixes: false },
                error: { ...state.error, easyFixes: errorMessage }
            }));
        }
    }
}));