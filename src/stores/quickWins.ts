import { create } from 'zustand'
import { GitHubIssue } from '@/types/quickWins'
import { githubAPIClient, type MappedIssue } from '@/lib/api/github-api-client';
import { useDataCacheStore } from './cache'
import { githubGraphQLClient } from '@/lib/api/github-graphql-client'
import { useAuthStore } from './auth';



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

   fetchGoodIssues: async () => {
    set((state) => ({
        loading: { ...state.loading, goodIssues: true },
        error: { ...state.error, goodIssues: null }
    }));

    try {
        // Get user token from auth store
        const authState = useAuthStore.getState();
        const userToken = authState.orgData?.token;
        
        if (!userToken) {
            throw new Error('GitHub token required');
        }
        
        // Set token in GraphQL client
        githubGraphQLClient.setToken(userToken);
        
        // Fetch using GraphQL - now returns GitHubIssue[]
        const issues = await githubGraphQLClient.getGoodFirstIssues(100);
        
        set((state) => ({
            goodIssues: issues, // Now type-compatible!
            loading: { ...state.loading, goodIssues: false },
            error: { ...state.error, goodIssues: null }
        }));
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => ({
            goodIssues: [],
            loading: { ...state.loading, goodIssues: false },
            error: { ...state.error, goodIssues: errorMessage }
        }));
    }
},
   fetchEasyFixes: async () => {
    set((state) => ({
        loading: { ...state.loading, easyFixes: true },
        error: { ...state.error, easyFixes: null }
    }));

    try {
        // Get user token from auth store
        const authState = useAuthStore.getState();
        const userToken = authState.orgData?.token;
        
        if (!userToken) {
            throw new Error('GitHub token required');
        }
        
        // Set token in GraphQL client
        githubGraphQLClient.setToken(userToken);
        
        // Fetch using GraphQL (much more efficient!)
        const issues = await githubGraphQLClient.getEasyFixes(100);
        
        set((state) => ({
            easyFixes: issues,
            loading: { ...state.loading, easyFixes: false },
            error: { ...state.error, easyFixes: null }
        }));
        
       
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => ({
            easyFixes: [],
            loading: { ...state.loading, easyFixes: false },
            error: { ...state.error, easyFixes: errorMessage }
        }));
    }
}
}));