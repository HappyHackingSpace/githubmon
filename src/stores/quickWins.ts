import { create } from 'zustand'


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


    fetchGoodIssues: () => {
        set((state) => ({
            loading: { ...state.loading, goodIssues: true }
        }));

        setTimeout(() => {
            set((state) => ({
                goodIssues: [
                    {
                        id: 101,
                        title: "Fix login bug",
                        repository: "example/repo1",
                        repositoryUrl: "https://github.com/example/repo1",
                        url: "https://github.com/example/repo1/issues/101",
                        labels: [
                            { name: "bug", color: "d73a4a" },
                            { name: "good first issue", color: "7057ff" }
                        ],
                        created_at: "2023-07-01T10:00:00Z",
                        updated_at: "2023-07-01T12:00:00Z",
                        difficulty: 'easy',
                        language: "TypeScript",
                        stars: 123,
                        author: {
                            login: "octocat",
                            avatar_url: "https://avatars.githubusercontent.com/u/1?v=4"
                        },
                        comments: 2,
                        state: 'open',
                        assignee: null,
                        priority: 'high'
                    },
                    {
                        id: 102,
                        title: "Improve loading time",
                        repository: "example/repo2",
                        repositoryUrl: "https://github.com/example/repo2",
                        url: "https://github.com/example/repo2/issues/102",
                        labels: [
                            { name: "enhancement", color: "a2eeef" },
                            { name: "good first issue", color: "7057ff" }
                        ],
                        created_at: "2023-07-02T09:00:00Z",
                        updated_at: "2023-07-02T10:00:00Z",
                        difficulty: 'medium',
                        language: "JavaScript",
                        stars: 99,
                        author: {
                            login: "hubot",
                            avatar_url: "https://avatars.githubusercontent.com/u/2?v=4"
                        },
                        comments: 1,
                        state: 'open',
                        assignee: null,
                        priority: 'medium'
                    },
                    {
                        id: 103,
                        title: "Add unit tests",
                        repository: "example/repo3",
                        repositoryUrl: "https://github.com/example/repo3",
                        url: "https://github.com/example/repo3/issues/103",
                        labels: [
                            { name: "testing", color: "e4e669" },
                            { name: "good first issue", color: "7057ff" }
                        ],
                        created_at: "2023-07-03T08:00:00Z",
                        updated_at: "2023-07-03T09:00:00Z",
                        difficulty: 'easy',
                        language: "Go",
                        stars: 45,
                        author: {
                            login: "testuser",
                            avatar_url: "https://avatars.githubusercontent.com/u/3?v=4"
                        },
                        comments: 0,
                        state: 'open',
                        assignee: null,
                        priority: 'low'
                    }
                ],
                loading: { ...state.loading, goodIssues: false }
            }));
        }, 1000);
    },


    fetchEasyFixes: () => {
        set((state) => ({
            loading: { ...state.loading, easyFixes: true }
        }));

        setTimeout(() => {
            set((state) => ({
                easyFixes: [
                    {
                        id: 201,
                        title: "Fix typo in README",
                        repository: "example/repo1",
                        repositoryUrl: "https://github.com/example/repo1",
                        url: "https://github.com/example/repo1/issues/201",
                        labels: [
                            { name: "documentation", color: "0075ca" },
                            { name: "easy", color: "bfe5bf" }
                        ],
                        created_at: "2023-07-04T11:00:00Z",
                        updated_at: "2023-07-04T12:00:00Z",
                        difficulty: 'easy',
                        language: "Markdown",
                        stars: 10,
                        author: {
                            login: "typo-fixer",
                            avatar_url: "https://avatars.githubusercontent.com/u/4?v=4"
                        },
                        comments: 0,
                        state: 'open',
                        assignee: null,
                        priority: 'low'
                    },
                    {
                        id: 202,
                        title: "Update package version",
                        repository: "example/repo2",
                        repositoryUrl: "https://github.com/example/repo2",
                        url: "https://github.com/example/repo2/issues/202",
                        labels: [
                            { name: "maintenance", color: "cfd3d7" },
                            { name: "easy", color: "bfe5bf" }
                        ],
                        created_at: "2023-07-05T10:00:00Z",
                        updated_at: "2023-07-05T11:00:00Z",
                        difficulty: 'easy',
                        language: "JSON",
                        stars: 5,
                        author: {
                            login: "maintainer",
                            avatar_url: "https://avatars.githubusercontent.com/u/5?v=4"
                        },
                        comments: 1,
                        state: 'open',
                        assignee: null,
                        priority: 'medium'
                    }
                ],
                loading: { ...state.loading, easyFixes: false }
            }));
        }, 500);
    },

}))