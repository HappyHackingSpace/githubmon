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
            
            const formattedIssues: GitHubIssue[] = issues.map((item: unknown) => {
                console.log('🔍 Good First Issues - Mapping item:', item);
                const typedItem = item as {
                    id: number;
                    title: string;
                    repo: string;
                    url: string;
                    labels: string[];
                    createdAt: string;
                    updatedAt: string;
                    created_at?: string;
                    updated_at?: string;
                    language: string;
                    stars: number;
                    author: string;
                    comments?: number;
                    priority: 'low' | 'medium' | 'high' | 'urgent';
                    [key: string]: unknown;
                };
                const formatted = {
                    id: typedItem.id,
                    title: typedItem.title,
                    repository: typedItem.repo,
                    repositoryUrl: `https://github.com/${typedItem.repo}`,
                    url: typedItem.url || '',
                    labels: (typedItem.labels || []).map((name: string) => ({ name, color: '999999' })),
                    created_at: typedItem.createdAt || typedItem.created_at || '',
                    updated_at: typedItem.updatedAt || typedItem.updated_at || '',
                    difficulty: 'easy' as const,
                    language: typedItem.language || 'unknown',
                    stars: typedItem.stars || 0,
                    author: { login: typedItem.author || '', avatar_url: '' },
                    comments: typedItem.comments || 0,
                    state: 'open' as const,
                    assignee: null,
                    priority: (typedItem.priority === 'urgent' ? 'high' : typedItem.priority) as 'low' | 'medium' | 'high',
                };
                console.log('🔍 Good First Issues - Formatted:', {
                    id: formatted.id,
                    stars: formatted.stars,
                    originalStars: typedItem.stars
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
            
            const formattedIssues: GitHubIssue[] = issues.map((item: unknown) => {
                console.log('🔍 Easy Fixes - Mapping item:', item);
                const typedItem = item as {
                    id: number;
                    title: string;
                    repo: string;
                    url: string;
                    labels: string[];
                    createdAt: string;
                    updatedAt: string;
                    created_at?: string;
                    updated_at?: string;
                    language: string;
                    stars: number;
                    author: string;
                    comments?: number;
                    priority: 'low' | 'medium' | 'high' | 'urgent';
                    [key: string]: unknown;
                };
                const formatted = {
                    id: typedItem.id,
                    title: typedItem.title,
                    repository: typedItem.repo,
                    repositoryUrl: `https://github.com/${typedItem.repo}`,
                    url: typedItem.url || '',
                    labels: (typedItem.labels || []).map((name: string) => ({ name, color: '999999' })),
                    created_at: typedItem.createdAt || typedItem.created_at || '',
                    updated_at: typedItem.updatedAt || typedItem.updated_at || '',
                    difficulty: 'easy' as const,
                    language: typedItem.language || 'unknown',
                    stars: typedItem.stars || 0,
                    author: { login: typedItem.author || '', avatar_url: '' },
                    comments: typedItem.comments || 0,
                    state: 'open' as const,
                    assignee: null,
                    priority: (typedItem.priority === 'urgent' ? 'high' : typedItem.priority) as 'low' | 'medium' | 'high',
                };
                console.log('🔍 Easy Fixes - Formatted:', {
                    id: formatted.id,
                    stars: formatted.stars,
                    originalStars: typedItem.stars
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