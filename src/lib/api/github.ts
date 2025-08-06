import { GitHubIssue } from '@/types/quickWins';

const GITHUB_API_URL = 'https://api.github.com';

const CACHE_DURATION = 1000 * 60 * 60 * 12; 
const issuesCache: Record<string, { timestamp: number; data: GitHubIssue[] }> = {};

async function fetchIssuesFromGitHub({
    owner,
    repo,
    labels = '',
    per_page = 10,
    state = 'open',
    token = ''
}: {
    owner: string;
    repo: string;
    labels?: string;
    per_page?: number;
    state?: 'open' | 'closed' | 'all';
    token?: string;
}): Promise<GitHubIssue[]> {
    const cacheKey = `${owner}/${repo}|${labels}|${per_page}|${state}|${token}`;
    const now = Date.now();
    if (issuesCache[cacheKey] && now - issuesCache[cacheKey].timestamp < CACHE_DURATION) {
        return issuesCache[cacheKey].data;
    }
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues?state=${state}&labels=${labels}&per_page=${per_page}`;
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('GitHub API error');
    const data = await res.json();
    // Her issue için kendi repository'sinden language ve stars bilgisini çek
    const issues = await Promise.all(data.map(async (issue: any) => {
        let repoData: any = {};
        try {
            const repoRes = await fetch(issue.repository_url, { headers });
            if (repoRes.ok) {
                repoData = await repoRes.json();
            }
        } catch (e) {
            repoData = {};
        }
        return {
            id: issue.id,
            title: issue.title,
            repository: repoData.full_name || `${owner}/${repo}`,
            repositoryUrl: issue.repository_url.replace('api.github.com/repos', 'github.com'),
            url: issue.html_url,
            labels: issue.labels.map((l: any) => ({ name: l.name, color: l.color })),
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            difficulty:
                issue.labels.some((l: any) => l.name.toLowerCase().includes('good first issue'))
                    ? 'good'
                    : issue.labels.some((l: any) => l.name.toLowerCase().includes('easy'))
                        ? 'easy'
                        : issue.labels.some((l: any) => l.name.toLowerCase().includes('medium'))
                            ? 'medium'
                            : undefined,
            language: repoData.language || 'unknown',
            stars: repoData.stargazers_count || 0,
            author: {
                login: issue.user.login,
                avatar_url: issue.user.avatar_url,
            },
            comments: issue.comments,
            state: issue.state,
            assignee: issue.assignee,
            priority: 'medium',
        };
    }));
    issuesCache[cacheKey] = { timestamp: now, data: issues };
    return issues;
}

export { fetchIssuesFromGitHub };
