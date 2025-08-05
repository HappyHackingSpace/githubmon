import type {
  TrendingRepo,
  TopContributor
} from '@/types/oss-insight'

interface GitHubSearchResponse<T> {
  items: T[]
  total_count: number
  incomplete_results: boolean
}

interface GitHubRepositoryResponse {
  id: number
  full_name: string
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  html_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  watchers_count: number
  archived: boolean
  fork: boolean
  topics: string[]
  owner: {
    login: string
    avatar_url: string
    type: string
  }
}

interface GitHubUserResponse {
  login: string
  avatar_url: string
  html_url: string
  type: string
  bio: string | null
}

interface GitHubIssueResponse {
  id: number
  title: string
  repository_url: string
  html_url: string
  created_at: string
  updated_at: string
  assignee: {
    login: string
  } | null
  user: {
    login: string
  }
  labels: Array<{ name: string }>
  comments: number
  pull_request?: unknown
}

class GitHubAPIClient {
  private baseUrl = 'https://api.github.com'
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  private githubToken = process.env.GITHUB_TOKEN || ''

 setUserToken(token: string) {
    // Basic validation
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Invalid GitHub token: must be a non-empty string')
    }

    const trimmedToken = token.trim()

   
    const isClassicToken = /^ghp_[A-Za-z0-9]{36}$/.test(trimmedToken)
    const isFineGrainedToken = /^github_pat_[A-Za-z0-9_]{82}$/.test(trimmedToken)
    const isGitHubAppToken = /^ghs_[A-Za-z0-9]{36}$/.test(trimmedToken)
    
    const isLegacyToken = /^[a-f0-9]{40}$/.test(trimmedToken)

    if (!isClassicToken && !isFineGrainedToken && !isGitHubAppToken && !isLegacyToken) {
      throw new Error(
        'Invalid GitHub token format. Expected:\n' +
        '- Classic token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (40 chars)\n' +
        '- Fine-grained token: github_pat_xxxxxxxxxx... (94 chars)\n' +
        '- GitHub App token: ghs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (40 chars)\n' +
        '- Legacy token: 40 character hexadecimal string'
      )
    }

    // Additional length validation
    if (trimmedToken.length < 40) {
      throw new Error('GitHub token is too short. Minimum length is 40 characters.')
    }

    if (trimmedToken.length > 255) {
      throw new Error('GitHub token is too long. Maximum length is 255 characters.')
    }

    this.githubToken = trimmedToken
  }

  /**
   * Check if a valid GitHub token is currently set
   */
  hasValidToken(): boolean {
    return this.githubToken.length >= 40
  }

  /**
   * Clear the current GitHub token
   */
  clearToken(): void {
    this.githubToken = ''
  }

  private async fetchWithCache<T>(endpoint: string, useGithub = false): Promise<T> {
    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T
    }

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHubMon/1.0'
      }

      // Add GitHub token if available for authenticated requests
      if (useGithub && this.githubToken) {
        headers['Authorization'] = `token ${this.githubToken}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, { headers })

      if (!response.ok) {
        console.warn(`API Error ${response.status} for ${endpoint}`)
        if (response.status === 403) {
          console.warn('GitHub API rate limit exceeded')
        }
        // Return fallback data on error
        return this.getFallbackData(endpoint) as T
      }

      const data = await response.json()

      // GitHub API response
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data

    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)

      // Return cached data if available
      if (cached) {
        console.log('Returning stale cached data due to error')
        return cached.data as T
      }

      // Fallback to mock data
      return this.getFallbackData(endpoint) as T
    }
  }

  private getFallbackData(endpoint: string): unknown {
    // Return mock trending repositories if the real API fails
    if (endpoint.includes('search/repositories')) {
      return {
        items: [
          {
            id: 1,
            full_name: 'microsoft/vscode',
            name: 'vscode',
            description: 'Visual Studio Code',
            stargazers_count: 163000,
            forks_count: 28000,
            open_issues_count: 5000,
            language: 'TypeScript',
            html_url: 'https://github.com/microsoft/vscode',
            created_at: '2015-09-03T19:55:15Z',
            updated_at: '2024-01-01T12:00:00Z',
            pushed_at: '2024-01-01T12:00:00Z',
            size: 35000,
            watchers_count: 163000,
            archived: false,
            fork: false,
            topics: ['editor', 'vscode', 'typescript'],
            owner: {
              login: 'microsoft',
              avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
              type: 'Organization'
            }
          }
        ]
      }
    }

    return { error: 'No fallback data available' }
  }

  async searchRepositories(query: string, sort: 'stars' | 'forks' | 'updated' = 'stars', limit = 20): Promise<TrendingRepo[]> {
    try {
      const response = await this.fetchWithCache<GitHubSearchResponse<GitHubRepositoryResponse>>(
        `/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${limit}`,
        true
      )

      return response.items?.map((repo: GitHubRepositoryResponse) => ({
        id: repo.id,
        full_name: repo.full_name,
        name: repo.name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        language: repo.language,
        html_url: repo.html_url,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        size: repo.size,
        watchers_count: repo.watchers_count,
        archived: repo.archived,
        fork: repo.fork,
        topics: repo.topics || [],
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          type: repo.owner.type
        }
      })) || []
    } catch (error) {
      console.error('Search repos error:', error)
      return []
    }
  }

  async searchUsers(query: string, type: 'users' | 'orgs' | 'all' = 'all', limit = 20): Promise<TopContributor[]> {
    try {
      const searchType = type === 'orgs' ? 'org' : type === 'users' ? 'user' : ''
      const queryString = searchType ? `${query} type:${searchType}` : query

      const response = await this.fetchWithCache<GitHubSearchResponse<GitHubUserResponse>>(
        `/search/users?q=${encodeURIComponent(queryString)}&per_page=${limit}`,
        true
      )

      return response.items?.map((user: GitHubUserResponse) => ({
        login: user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        contributions: 0,
        repos_count: 0,
        stars_earned: 0,
        followers_count: 0,
        languages: [],
        type: user.type as 'User' | 'Organization',
        rank: 0,
        rank_change: 0,
        bio: user.bio || ''
      })) || []
    } catch (error) {
      console.error('Search users error:', error)
      return []
    }
  }

  // ============ ACTION ITEMS API METHODS ============
  
  // Get assigned issues and PRs for the authenticated user
async getAssignedItems(username?: string): Promise<unknown[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for assigned items')
      return []
    }
    try {
      const user = username || '@me'
      const endpoint = `/search/issues?q=assignee:${user}+state:open&sort=updated&order=desc&per_page=50`
      const response = await this.fetchWithCache<GitHubSearchResponse<GitHubIssueResponse>>(endpoint, true)
      
      return response.items?.map((item: GitHubIssueResponse) => ({
        id: item.id,
        title: item.title,
        repo: item.repository_url
          ? item.repository_url.split('/').slice(-2).join('/')
          : 'unknown/unknown',
        type: item.pull_request ? 'pr' : 'issue',
        priority: this.calculatePriority(item),
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        assignee: item.assignee?.login,
        author: item.user?.login,
        labels: item.labels?.map((l: { name: string }) => l.name) || [],
        assignedAt: item.created_at // Approximation
      })) || []
    } catch (error) {
      console.error('Failed to fetch assigned items:', error)
      return []
    }
  }

  async getMentionItems(username?: string): Promise<unknown[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for mentions')
      return []
    }

    try {
      const user = username || '@me'
      const mentionsEndpoint = `/search/issues?q=mentions:${user}+state:open&sort=updated&order=desc&per_page=25`
      const reviewRequestsEndpoint = `/search/issues?q=review-requested:${user}+state:open&sort=updated&order=desc&per_page=25`
      
      const [mentionsResponse, reviewsResponse] = await Promise.all([
        this.fetchWithCache<GitHubSearchResponse<GitHubIssueResponse>>(mentionsEndpoint, true),
        this.fetchWithCache<GitHubSearchResponse<GitHubIssueResponse>>(reviewRequestsEndpoint, true)
      ])

      const mentions = mentionsResponse.items?.map((item: GitHubIssueResponse) => ({
        id: item.id,
        title: item.title,
        repo: item.repository_url.split('/').slice(-2).join('/'),
        type: item.pull_request ? 'pr' : 'issue',
        priority: this.calculatePriority(item),
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: item.user?.login,
        labels: item.labels?.map((l: { name: string }) => l.name) || [],
        mentionType: 'mention',
        mentionedAt: item.updated_at
      })) || []

      const reviews = reviewsResponse.items?.map((item: GitHubIssueResponse) => ({
        id: `review-${item.id}`, 
        title: item.title,
       repo: item.repository_url 
         ? item.repository_url.split('/').slice(-2).join('/')
          : 'unknown/unknown',
        type: 'pr',
        priority: this.calculatePriority(item),
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: item.user?.login,
        labels: item.labels?.map((l: { name: string }) => l.name) || [],
        mentionType: 'review_request',
        mentionedAt: item.updated_at
      })) || []

      return [...mentions, ...reviews].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } catch (error) {
      console.error('Failed to fetch mentions:', error)
      return []
    }
  }

  async getStaleItems(username?: string, daysOld: number = 7): Promise<unknown[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for stale items')
      return []
    }

    try {
      const user = username || '@me'
      const date = new Date()
      date.setDate(date.getDate() - daysOld)
      const dateString = date.toISOString().split('T')[0]
      
      const endpoint = `/search/issues?q=author:${user}+type:pr+state:open+updated:<${dateString}&sort=updated&order=asc&per_page=50`
      const response = await this.fetchWithCache<GitHubSearchResponse<GitHubIssueResponse>>(endpoint, true)
      
      return response.items?.map((item: GitHubIssueResponse) => {
        const lastActivity = new Date(item.updated_at)
        const daysStale = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          id: item.id,
          title: item.title,
           repo: item.repository_url 
            ? item.repository_url.split('/').slice(-2).join('/')
            : 'unknown/unknown',
          type: 'pr',
          priority: daysStale > 30 ? 'high' : daysStale > 14 ? 'medium' : 'low',
          url: item.html_url,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          author: item.user?.login,
          labels: item.labels?.map((l: { name: string }) => l.name) || [],
          lastActivity: item.updated_at,
          daysStale,
          daysOld: daysStale,
          reviewStatus: 'pending' 
        }
      }) || []
    } catch (error) {
      console.error('Failed to fetch stale items:', error)
      return []
    }
  }

  async getGoodFirstIssues(): Promise<unknown[]> {
    try {
      const endpoint = `/search/issues?q=label:"good first issue"+state:open+type:issue&sort=updated&order=desc&per_page=50`
      const response = await this.fetchWithCache<GitHubSearchResponse<GitHubIssueResponse>>(endpoint, true)
      
      return response.items?.map((item: GitHubIssueResponse) => ({
        id: item.id,
        title: item.title,
        repo: item.repository_url 
          ? item.repository_url.split('/').slice(-2).join('/')
          : 'unknown/unknown',
        type: 'issue',
        priority: this.calculatePriority(item),
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: item.user?.login,
        labels: item.labels?.map((l: { name: string }) => l.name) || [],
        daysOld: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))
      })) || []
    } catch (error) {
      console.error('Failed to fetch good first issues:', error)
      return []
    }
  }

  async getEasyFixes(): Promise<unknown[]> {
    try {
      const labels = ['easy', 'easy fix', 'beginner', 'starter', 'help wanted']
      const labelQuery = labels.map(label => `label:"${label}"`).join(' OR ')
      const endpoint = `/search/issues?q=(${labelQuery})+state:open+type:issue&sort=updated&order=desc&per_page=50`
      const response = await this.fetchWithCache<GitHubSearchResponse<GitHubIssueResponse>>(endpoint, true)
      
      return response.items?.map((item: GitHubIssueResponse) => ({
        id: item.id,
        title: item.title,
        repo: item.repository_url 
          ? item.repository_url.split('/').slice(-2).join('/')
          : 'unknown/unknown',
        type: 'issue',
        priority: this.calculatePriority(item),
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: item.user?.login,
        labels: item.labels?.map((l: { name: string }) => l.name) || [],
        daysOld: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))
      })) || []
    } catch (error) {
      console.error('Failed to fetch easy fixes:', error)
      return []
    }
  }

  private calculatePriority(item: GitHubIssueResponse): 'low' | 'medium' | 'high' | 'urgent' {
    const labels = item.labels?.map((l: { name: string }) => l.name.toLowerCase()) || []
    const commentCount = item.comments || 0
    const daysSinceUpdate = Math.floor((Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    
    if (labels.some((l: string) => l.includes('critical') || l.includes('urgent') || l.includes('p0'))) {
      return 'urgent'
    }
    if (labels.some((l: string) => l.includes('high') || l.includes('p1') || l.includes('bug'))) {
      return 'high'
    }
    if (labels.some((l: string) => l.includes('low') || l.includes('p3') || l.includes('enhancement'))) {
      return 'low'
    }
    
    if (commentCount > 10 || daysSinceUpdate < 1) {
      return 'high'
    }
    if (commentCount > 5 || daysSinceUpdate < 3) {
      return 'medium'
    }
    
    return 'low'
  }
}

export const githubAPIClient = new GitHubAPIClient()
