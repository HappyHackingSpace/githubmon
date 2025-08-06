import { create } from 'zustand'
import { GitHubIssue } from '@/types/quickWins'
import { githubAPIClient } from '@/lib/api/github-api-client';

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
    fetchGoodIssues: () => Promise<void>
    fetchEasyFixes: () => Promise<void>
}

export const useQuickWinsStore = create<QuickWinsState>((set) => ({
    goodIssues: [],
    easyFixes: [],
    loading: { goodIssues: false, easyFixes: false },
    error: { goodIssues: null, easyFixes: null },

    fetchGoodIssues: async () => {
        set((state) => ({
            loading: { ...state.loading, goodIssues: true },
            error: { ...state.error, goodIssues: null }
        }));

        try {
            const issues = await githubAPIClient.getGoodFirstIssues();
            console.log('🔍 Good First Issues API Response:', issues);
            
            const formattedIssues: GitHubIssue[] = issues.map((item: any) => {
                console.log('🔍 Good First Issues - Mapping item:', item);
                const formatted = {
                    id: item.id,
                    title: item.title,
                    repository: item.repo,
                    repositoryUrl: `https://github.com/${item.repo}`,
                    url: item.url || '',
                    labels: (item.labels || []).map((name: string) => ({ name, color: '999999' })),
                    created_at: item.createdAt || item.created_at,
                    updated_at: item.updatedAt || item.updated_at,
                    difficulty: 'easy' as const,
                    language: item.language || 'unknown',
                    stars: item.stars || 0,
                    author: { login: item.author || '', avatar_url: '' },
                    comments: item.comments || 0,
                    state: 'open' as const,
                    assignee: null,
                    priority: item.priority || 'low' as const,
                };
                console.log('🔍 Good First Issues - Formatted:', {
                    id: formatted.id,
                    stars: formatted.stars,
                    originalStars: item.stars
                });
                return formatted;
            });

            set((state) => ({
                goodIssues: formattedIssues,
                loading: { ...state.loading, goodIssues: false },
                error: { ...state.error, goodIssues: null }
            }));
            console.log('🔍 Good First Issues - Final store data:', formattedIssues.map(i => ({ id: i.id, stars: i.stars })));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
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
            const issues = await githubAPIClient.getEasyFixes();
            console.log('🔍 Easy Fixes API Response:', issues);
            
            const formattedIssues: GitHubIssue[] = issues.map((item: any) => {
                console.log('🔍 Easy Fixes - Mapping item:', item);
                const formatted = {
                    id: item.id,
                    title: item.title,
                    repository: item.repo,
                    repositoryUrl: `https://github.com/${item.repo}`,
                    url: item.url || '',
                    labels: (item.labels || []).map((name: string) => ({ name, color: '999999' })),
                    created_at: item.createdAt || item.created_at,
                    updated_at: item.updatedAt || item.updated_at,
                    difficulty: 'easy' as const,
                    language: item.language || 'unknown',
                    stars: item.stars || 0,
                    author: { login: item.author || '', avatar_url: '' },
                    comments: item.comments || 0,
                    state: 'open' as const,
                    assignee: null,
                    priority: item.priority || 'low' as const,
                };
                console.log('🔍 Easy Fixes - Formatted:', {
                    id: formatted.id,
                    stars: formatted.stars,
                    originalStars: item.stars
                });
                return formatted;
            });

            set((state) => ({
                easyFixes: formattedIssues,
                loading: { ...state.loading, easyFixes: false },
                error: { ...state.error, easyFixes: null }
            }));
            console.log('🔍 Easy Fixes - Final store data:', formattedIssues.map(i => ({ id: i.id, stars: i.stars })));
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