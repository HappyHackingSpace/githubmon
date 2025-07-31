import { create } from 'zustand'
import { fetchIssuesFromGitHub } from '@/lib/api/github'
import { GitHubIssue } from '@/types/quickWins'

// Helper method to fetch issues from popular repos
async function fetchIssuesFromPopularRepos(
    labelQuery: string,
    issuesPerRepo: number = 10
): Promise<GitHubIssue[]> {
    try {
        const repoRes = await fetch('https://api.github.com/search/repositories?q=stars:%3E10000&sort=stars&order=desc&per_page=50');

        if (!repoRes.ok) {
            throw new Error(`GitHub API error: ${repoRes.status}`);
        }

        const repoData = await repoRes.json();

        if (!repoData.items || !Array.isArray(repoData.items)) {
            throw new Error('Repo bulunamadı');
        }

        const userToken = window.localStorage.getItem('github_token') || '';
        const batchSize = 5;
        const allIssues: GitHubIssue[][] = [];

        for (let i = 0; i < repoData.items.length; i += batchSize) {
            const batch = repoData.items.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (repo: any) => {
                    try {
                        const issues = await fetchIssuesFromGitHub({
                            owner: repo.owner.login,
                            repo: repo.name,
                            labels: labelQuery,
                            per_page: issuesPerRepo,
                            state: 'open',
                            token: userToken,
                        });
                        return issues;
                    } catch (error) {
                        console.warn(`Failed to fetch issues from ${repo.name}:`, error);
                        return [];
                    }
                })
            );
            allIssues.push(...batchResults);
        }

        return allIssues.flat().filter(Boolean).slice(0, 50);
    } catch (error) {
        console.error('Error fetching issues from popular repos:', error);
        throw error;
    }
}

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
            const flatIssues = await fetchIssuesFromPopularRepos('good first issue', 10);
            set((state) => ({
                goodIssues: flatIssues,
                loading: { ...state.loading, goodIssues: false },
                error: { ...state.error, goodIssues: null }
            }));
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
            const flatIssues = await fetchIssuesFromPopularRepos('easy fix', 10);
            set((state) => ({
                easyFixes: flatIssues,
                loading: { ...state.loading, easyFixes: false },
                error: { ...state.error, easyFixes: null }
            }));
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