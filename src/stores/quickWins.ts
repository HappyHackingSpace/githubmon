// Helper method to fetch issues from popular repos
async function fetchIssuesFromPopularRepos(
    labelQuery: string,
    issuesPerRepo: number = 10
): Promise<GitHubIssue[]> {
    const repoRes = await fetch('https://api.github.com/search/repositories?q=stars:%3E10000&sort=stars&order=desc&per_page=50');
    const repoData = await repoRes.json();
    if (!repoData.items || !Array.isArray(repoData.items)) throw new Error('Repo bulunamadı');
    const userToken = window.localStorage.getItem('github_token') || '';
    const batchSize = 5;
    const allIssues = [];
    for (let i = 0; i < repoData.items.length; i += batchSize) {
        const batch = repoData.items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (repo: any) => {
                const issues = await fetchIssuesFromGitHub({
                    owner: repo.owner.login,
                    repo: repo.name,
                    labels: labelQuery,
                    per_page: issuesPerRepo,
                    state: 'open',
                    token: userToken,
                });
                return issues;
            })
        );
        allIssues.push(...batchResults);
    }
    return allIssues.flat().filter(Boolean).slice(0, 50);
}
import { create } from 'zustand'
import { fetchIssuesFromGitHub } from '@/lib/api/github'
import { GitHubIssue } from '@/types/quickWins'

interface QuickWinsState {
    goodIssues: GitHubIssue[]
    easyFixes: GitHubIssue[]
    loading: {
        goodIssues: boolean
        easyFixes: boolean
    }
    fetchGoodIssues: () => void
    fetchEasyFixes: () => void
}

export const useQuickWinsStore = create<QuickWinsState>((set) => ({
    goodIssues: [],
    easyFixes: [],
    loading: { goodIssues: false, easyFixes: false },


    fetchGoodIssues: async () => {
        set((state) => ({
            loading: { ...state.loading, goodIssues: true }
        }));
        try {
            const repoRes = await fetch('https://api.github.com/search/repositories?q=stars:%3E10000&sort=stars&order=desc&per_page=50');
            const repoData = await repoRes.json();
            if (!repoData.items || !Array.isArray(repoData.items)) throw new Error('Repo bulunamadı');
            // 2. Her repo için 'good first issue' label'lı issue çek
            const userToken = window.localStorage.getItem('github_token') || '';
            // Process in smaller batches to avoid rate limits
            const batchSize = 5;
            const allIssues = [];
            for (let i = 0; i < repoData.items.length; i += batchSize) {
                const batch = repoData.items.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(async (repo: any) => {
                        const issues = await fetchIssuesFromGitHub({
                            owner: repo.owner.login,
                            repo: repo.name,
                            labels: 'good first issue',
                            per_page: 10,
                            state: 'open',
                            token: userToken,
                        });
                        // ... existing mapping logic ...
                        return issues;
                    })
                );
                allIssues.push(...batchResults);
            }
            // Düzleştir ve ilk 50'yi al
            const flatIssues = allIssues.flat().filter(Boolean).slice(0, 50);
            set((state) => ({
                goodIssues: flatIssues,
                loading: { ...state.loading, goodIssues: false }
            }));
        } catch (e) {
            set((state) => ({
                goodIssues: [],
                loading: { ...state.loading, goodIssues: false }
            }));
        }
    },

    fetchEasyFixes: async () => {
        set((state) => ({
            loading: { ...state.loading, easyFixes: true }
        }));
        try {
            // Use GitHub's OR syntax in a single query
            const labelQuery = 'label:easy OR label:"good first issue" OR label:"help wanted" OR label:beginner OR label:starter';
            const issues = await fetchIssuesFromPopularRepos(labelQuery, 10);
            set((state) => ({
                easyFixes: issues,
                loading: { ...state.loading, easyFixes: false }
            }));
        } catch (e) {
            set((state) => ({
                easyFixes: [],
                loading: { ...state.loading, easyFixes: false }
            }));
        }
    },

}))