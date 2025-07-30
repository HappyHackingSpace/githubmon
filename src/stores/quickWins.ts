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
            // 1. Popüler 50 repo çek
            const repoRes = await fetch('https://api.github.com/search/repositories?q=stars:%3E10000&sort=stars&order=desc&per_page=50');
            const repoData = await repoRes.json();
            if (!repoData.items || !Array.isArray(repoData.items)) throw new Error('Repo bulunamadı');
            // 2. Her repo için 'good first issue' label'lı issue çek
            const userToken = window.localStorage.getItem('github_token') || '';
            const allIssues = await Promise.all(
                repoData.items.map(async (repo: any) => {
                    const issues = await fetchIssuesFromGitHub({
                        owner: repo.owner.login,
                        repo: repo.name,
                        labels: 'good first issue',
                        per_page: 10,
                        state: 'open',
                        token: userToken,
                    });
                    // Avatarları issue.user'dan al
                    return issues.map(issue => {
                        if (issue && issue.author && repo.owner.avatar_url) {
                            issue.author.avatar_url = issue.author.avatar_url || repo.owner.avatar_url;
                        }
                        return issue;
                    });
                })
            );
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
            // 1. Popüler 50 repo çek
            const repoRes = await fetch('https://api.github.com/search/repositories?q=stars:%3E10000&sort=stars&order=desc&per_page=50');
            const repoData = await repoRes.json();
            if (!repoData.items || !Array.isArray(repoData.items)) throw new Error('Repo bulunamadı');
            // 2. Her repo için yaygın kolay etiketleri ayrı ayrı arayarak issue çek (OR mantığı)
            const easyLabels = ['easy', 'good first issue', 'help wanted', 'beginner', 'starter'];
            const userToken = window.localStorage.getItem('github_token') || '';
            const allIssues = await Promise.all(
                repoData.items.map(async (repo: any) => {
                    let issues: any[] = [];
                    for (const label of easyLabels) {
                        const found = await fetchIssuesFromGitHub({
                            owner: repo.owner.login,
                            repo: repo.name,
                            labels: label,
                            per_page: 5,
                            state: 'open',
                            token: userToken,
                        });
                        issues = issues.concat(found);
                        if (issues.length >= 10) break;
                    }
                    const unique = issues.filter((item, idx, arr) => arr.findIndex(i => i.id === item.id) === idx);
                    return unique.map(issue => {
                        if (issue && issue.author && repo.owner.avatar_url) {
                            issue.author.avatar_url = issue.author.avatar_url || repo.owner.avatar_url;
                        }
                        return issue;
                    });
                })
            );
            // Düzleştir ve ilk 50'yi al
            const flatIssues = allIssues.flat().filter(Boolean).slice(0, 50);
            set((state) => ({
                easyFixes: flatIssues,
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