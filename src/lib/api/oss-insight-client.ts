import type {
  TrendingRepo,
  TopLanguage,
  GitHubEvent,
  TopContributor,
  HotCollection,
  RepoStats
} from '@/types/oss-insight'

class OSSInsightClient {

  // Helper to map GitHub issue to action item format (for easy fixes)
  private mapGitHubIssueToActionItem(issue: any, language?: string) {
    return {
      id: issue.id,
      title: issue.title,
      repo: issue.repository_url ? issue.repository_url.split('/').slice(-2).join('/') : 'unknown/unknown',
      type: 'issue',
      priority: this.calculatePriority(issue),
      url: issue.html_url,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      author: issue.user?.login,
      labels: issue.labels?.map((l: any) => l.name) || [],
      language: language || 'Unknown',
      stars: 0,
      comments: issue.comments || 0,
      difficulty: 'Easy'
    }
  }
  private baseUrl = 'https://api.github.com'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  private githubBaseUrl = 'https://api.github.com'
  private githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''

  setUserToken(token: string) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Invalid GitHub token: must be a non-empty string')
    }
    this.githubToken = token
  }

  private async fetchWithCache<T>(endpoint: string, useGithub = false): Promise<T> {
    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const baseUrl = useGithub ? this.githubBaseUrl : this.baseUrl
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHubMon/1.0'
      }

      // Add GitHub token if available for authenticated requests
      if (useGithub && this.githubToken) {
        headers['Authorization'] = `token ${this.githubToken}`
      }

      const response = await fetch(`${baseUrl}${endpoint}`, { headers })

      if (!response.ok) {
        console.warn(`API Error ${response.status} for ${endpoint}`)
        if (response.status === 403) {
          console.warn('GitHub API rate limit exceeded')
        }
        // Return fallback data on error
        return this.getFallbackData(endpoint)
      }

      const data = await response.json()

      // OSS Insight API response format
      if (!useGithub && data.data) {
        const result = this.transformOSSInsightResponse(data.data, endpoint)
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
        return result
      }

      // GitHub API response
      if (useGithub) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      }

      return data

    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)

      // Return cached data if available
      if (cached) {
        console.log('Returning stale cached data due to error')
        return cached.data
      }

      // Fallback to mock data
      return this.getFallbackData(endpoint)
    }
  }

  private transformOSSInsightResponse(data: any, endpoint: string): any {
    if (!data.rows) return []

    // Transform OSS Insight SQL response to our format
    const columns = data.columns?.map((col: any) => col.col) || []

    return data.rows.map((row: any) => {
      const obj: any = {}
      columns.forEach((col: string, index: number) => {
        obj[col] = row[col] || Object.values(row)[index]
      })
      return obj
    })
  }

  private getFallbackData(endpoint: string): any {
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
          },
          {
            id: 2,
            full_name: 'facebook/react',
            name: 'react',
            description: 'The library for web and native user interfaces',
            stargazers_count: 228000,
            forks_count: 46000,
            open_issues_count: 1200,
            language: 'JavaScript',
            html_url: 'https://github.com/facebook/react',
            created_at: '2013-05-24T16:15:54Z',
            updated_at: '2024-01-01T12:00:00Z',
            pushed_at: '2024-01-01T12:00:00Z',
            size: 20000,
            watchers_count: 228000,
            archived: false,
            fork: false,
            topics: ['react', 'javascript', 'library', 'frontend'],
            owner: {
              login: 'facebook',
              avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
              type: 'Organization'
            }
          },
          {
            id: 3,
            full_name: 'tensorflow/tensorflow',
            name: 'tensorflow',
            description: 'An Open Source Machine Learning Framework for Everyone',
            stargazers_count: 185000,
            forks_count: 74000,
            open_issues_count: 3200,
            language: 'C++',
            html_url: 'https://github.com/tensorflow/tensorflow',
            created_at: '2015-11-07T01:19:20Z',
            updated_at: '2024-01-01T12:00:00Z',
            pushed_at: '2024-01-01T12:00:00Z',
            size: 250000,
            watchers_count: 185000,
            archived: false,
            fork: false,
            topics: ['machine-learning', 'tensorflow', 'deep-learning'],
            owner: {
              login: 'tensorflow',
              avatar_url: 'https://avatars.githubusercontent.com/u/15658638?v=4',
              type: 'Organization'
            }
          },
          {
            id: 4,
            full_name: 'vuejs/vue',
            name: 'vue',
            description: 'Vue.js is a progressive, incrementally-adoptable JavaScript framework',
            stargazers_count: 207000,
            forks_count: 33000,
            open_issues_count: 356,
            language: 'TypeScript',
            html_url: 'https://github.com/vuejs/vue',
            created_at: '2013-07-29T03:24:51Z',
            updated_at: '2024-01-01T12:00:00Z',
            pushed_at: '2024-01-01T12:00:00Z',
            size: 35000,
            watchers_count: 207000,
            archived: false,
            fork: false,
            topics: ['vue', 'javascript', 'frontend', 'framework'],
            owner: {
              login: 'vuejs',
              avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
              type: 'Organization'
            }
          },
          {
            id: 5,
            full_name: 'angular/angular',
            name: 'angular',
            description: 'Deliver web apps with confidence',
            stargazers_count: 95000,
            forks_count: 25000,
            open_issues_count: 1800,
            language: 'TypeScript',
            html_url: 'https://github.com/angular/angular',
            created_at: '2014-09-18T16:12:01Z',
            updated_at: '2024-01-01T12:00:00Z',
            pushed_at: '2024-01-01T12:00:00Z',
            size: 45000,
            watchers_count: 95000,
            archived: false,
            fork: false,
            topics: ['angular', 'typescript', 'frontend', 'framework'],
            owner: {
              login: 'angular',
              avatar_url: 'https://avatars.githubusercontent.com/u/139426?v=4',
              type: 'Organization'
            }
          },
          {
            id: 6,
            full_name: 'nodejs/node',
            name: 'node',
            description: 'Node.js JavaScript runtime',
            stargazers_count: 106000,
            forks_count: 29000,
            open_issues_count: 1500,
            language: 'JavaScript',
            html_url: 'https://github.com/nodejs/node',
            created_at: '2014-11-26T19:51:11Z',
            updated_at: '2024-01-01T12:00:00Z',
            pushed_at: '2024-01-01T12:00:00Z',
            size: 180000,
            watchers_count: 106000,
            archived: false,
            fork: false,
            topics: ['nodejs', 'javascript', 'runtime'],
            owner: {
              login: 'nodejs',
              avatar_url: 'https://avatars.githubusercontent.com/u/9950313?v=4',
              type: 'Organization'
            }
          }
        ]
      }
    }

    if (endpoint.includes('events')) return []
    if (endpoint.includes('contributors')) return []
    if (endpoint.includes('collections')) return []
    return { error: 'No fallback data available' }
  }

  // Trending Repositories - Real GitHub API endpoint with fallback
  async getTrendingRepos(period: '24h' | '7d' | '30d' = '24h', limit = 20): Promise<TrendingRepo[]> {
    try {
      console.log(`Fetching trending repos for period: ${period}`)

      // Use a broader search query that's more likely to work
      const created = this.getDateFilter(period)
      const endpoint = `/search/repositories?q=created:>${created} stars:>10&sort=stars&order=desc&per_page=${Math.min(limit, 30)}`

      const response = await this.fetchWithCache<any>(endpoint, true)

      if (response && response.items && Array.isArray(response.items)) {
        console.log(`Successfully fetched ${response.items.length} repositories`)
        return response.items.map((repo: any) => ({
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
          archived: repo.archived || false,
          fork: repo.fork || false,
          topics: repo.topics || [],
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
            type: repo.owner.type
          },
          stars_increment: Math.floor(Math.random() * 100) + 1
        }))
      }

      console.warn('API response was invalid, falling back to mock data')
      return this.getMockTrendingRepos(limit)

    } catch (error) {
      console.error('getTrendingRepos error:', error)
      return this.getMockTrendingRepos(limit)
    }
  }

  private getMockTrendingRepos(limit: number): TrendingRepo[] {
    const fallbackResponse = this.getFallbackData('/search/repositories')
    if (fallbackResponse && fallbackResponse.items) {
      return fallbackResponse.items.slice(0, limit).map((repo: any) => ({
        ...repo,
        stars_increment: Math.floor(Math.random() * 100) + 1
      }))
    }
    return []
  }

  private getDateFilter(period: string): string {
    const now = new Date()
    switch (period) {
      case '24h': now.setDate(now.getDate() - 1); break
      case '7d': now.setDate(now.getDate() - 7); break
      case '30d': now.setDate(now.getDate() - 30); break
    }
    return now.toISOString().split('T')[0]
  }

  // GitHub API fallback for languages
  async getTopLanguages(period: '7d' | '30d' | '90d' = '30d'): Promise<TopLanguage[]> {
    try {

      const languages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'PHP', 'C++', 'C', 'Shell', 'Ruby']
      const results: TopLanguage[] = []

      for (let i = 0; i < Math.min(languages.length, 8); i++) {
        const lang = languages[i]
        try {
          const response = await this.fetchWithCache<any>(
            `/search/repositories?q=language:${lang}&sort=stars&order=desc&per_page=1`,
            true
          )

          results.push({
            language: lang,
            repos_count: response.total_count || 1000,
            stars_count: response.total_count * 100 || 100000,
            developers_count: response.total_count * 10 || 10000,
            percentage_of_total: Math.random() * 15,
            trend: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
            rank: i + 1,
            rank_change: Math.floor(Math.random() * 3) - 1
          })
        } catch (err) {
          console.warn(`Failed to fetch data for ${lang}`)
        }
      }

      return results.length > 0 ? results : []
    } catch (error) {
      console.error('Languages fallback:', error)
      return []
    }
  }

  // GitHub API fallback for events
  async getRecentEvents(limit = 50): Promise<GitHubEvent[]> {
    try {
      const response = await this.fetchWithCache<any[]>('/events?per_page=' + Math.min(limit, 30), true)

      return response.map((event: any) => ({
        id: event.id,
        type: event.type,
        actor: {
          login: event.actor?.login || '',
          display_login: event.actor?.display_login || '',
          avatar_url: event.actor?.avatar_url || '',
          url: event.actor?.url || ''
        },
        repo: {
          name: event.repo?.name || '',
          url: event.repo?.url || ''
        },
        payload: event.payload || {},
        created_at: event.created_at || new Date().toISOString(),
        public: event.public || true
      }))
    } catch (error) {
      console.error('Events fallback:', error)
      return []
    }
  }

  // Mock data for other endpoints
  async getTopContributors(period: '7d' | '30d' | '90d' = '30d', limit = 20): Promise<TopContributor[]> {
    return []
  }

  async getHotCollections(limit = 10): Promise<HotCollection[]> {
    return [
      {
        id: '1',
        name: 'Web Development',
        description: 'Modern web development tools and frameworks',
        repos_count: 1250,
        total_stars: 890000,
        featured_repos: [],
        tags: ['web', 'frontend', 'javascript'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Machine Learning',
        description: 'AI and ML libraries and tools',
        repos_count: 890,
        total_stars: 1200000,
        featured_repos: [],
        tags: ['ai', 'ml', 'python'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  async getRepositoryStats(): Promise<RepoStats> {
    return {
      total_repos: 2100000,
      total_stars: 450000000,
      total_forks: 89000000,
      total_commits_last_month: 12000000,
      active_repos_count: 850000,
      new_repos_last_month: 45000,
      trending_repos_count: 1250,
      languages_count: 200,
      developers_count: 89000
    }
  }


  async searchRepositories(query: string, sort: 'stars' | 'forks' | 'updated' = 'stars', limit = 20): Promise<TrendingRepo[]> {
    try {
      const response = await this.fetchWithCache<any>(
        `/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${limit}`,
        true
      )

      return response.items?.map((repo: any) => ({
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

      const response = await this.fetchWithCache<any>(
        `/search/users?q=${encodeURIComponent(queryString)}&per_page=${limit}`,
        true
      )

      return response.items?.map((user: any) => ({
        login: user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        contributions: 0,
        repos_count: 0,
        stars_earned: 0,
        followers_count: 0,
        languages: [],
        type: user.type,
        rank: 0,
        rank_change: 0,
        bio: user.bio || ''
      })) || []
    } catch (error) {
      console.error('Search users error:', error)
      return []
    }
  }

  // User Analytics Methods
  async getUserProfile(username: string): Promise<any> {
    try {
      const response = await this.fetchWithCache<any>(`/users/${username}`, true)
      return {
        login: response.login,
        avatar_url: response.avatar_url,
        html_url: response.html_url,
        bio: response.bio,
        public_repos: response.public_repos,
        followers: response.followers,
        following: response.following,
        created_at: response.created_at,
        updated_at: response.updated_at,
        company: response.company,
        location: response.location,
        blog: response.blog,
        type: response.type
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  async getUserRepositories(username: string, limit = 100): Promise<any[]> {
    try {
      const response = await this.fetchWithCache<any[]>(
        `/users/${username}/repos?per_page=${limit}&sort=updated&direction=desc`,
        true
      )
      return response || []
    } catch (error) {
      console.error('Get user repos error:', error)
      return []
    }
  }

  async getUserEvents(username: string, limit = 100): Promise<any[]> {
    try {
      const response = await this.fetchWithCache<any[]>(
        `/users/${username}/events?per_page=${limit}`,
        true
      )
      return response || []
    } catch (error) {
      console.error('Get user events error:', error)
      return []
    }
  }

  async getUserAnalytics(username: string): Promise<any> {
    try {
      // Get user profile
      const profile = await this.getUserProfile(username)
      if (!profile) return null

      // Get user repositories
      const repos = await this.getUserRepositories(username)

      // Get user events for activity analysis
      const events = await this.getUserEvents(username)

      // Process and analyze the data
      return this.processUserAnalytics(profile, repos, events)
    } catch (error) {
      console.error('Get user analytics error:', error)
      return null
    }
  }

  private processUserAnalytics(profile: any, repos: any[], events: any[]): any {
    // Calculate overview data from repositories
    const overviewData = this.calculateOverviewFromRepos(repos)

    // Calculate language distribution
    const languageData = this.calculateLanguageDistribution(repos)

    // Calculate behavior data from events
    const behaviorData = this.calculateBehaviorFromEvents(events)

    return {
      profile,
      overview: overviewData,
      languages: languageData,
      behavior: behaviorData
    }
  }

  private calculateOverviewFromRepos(repos: any[]): any[] {
    // Group repos by creation month for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentDate = new Date()
    const overviewData = []

    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = targetMonth.toLocaleDateString('en', { month: 'short' })

      const reposInMonth = repos.filter(repo => {
        const repoDate = new Date(repo.created_at)
        return repoDate.getMonth() === targetMonth.getMonth() &&
          repoDate.getFullYear() === targetMonth.getFullYear()
      })

      const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)
      // Group stars by repo creation month
      const starsPerMonth = repos.reduce((acc, repo) => {
        const month = new Date(repo.created_at).toLocaleDateString('en', { month: 'short' });
        acc[month] = (acc[month] || 0) + (repo.stargazers_count || 0);
        return acc;
      }, {});

      overviewData.push({
        name: monthName,
        stars: starsPerMonth[monthName] || 0,
        commits: reposInMonth.length * 10,
        repos: reposInMonth.length
      })
    }

    return overviewData
  }

  private calculateLanguageDistribution(repos: any[]): any[] {
    const languageCount: { [key: string]: number } = {}
    let totalRepos = 0

    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
        totalRepos++
      }
    })

    const languageColors: { [key: string]: string } = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f7df1e',
      'Python': '#3776ab',
      'Java': '#ed8b00',
      'C++': '#00599c',
      'C#': '#239120',
      'Go': '#00add8',
      'Rust': '#000000',
      'Swift': '#fa7343',
      'Kotlin': '#7f52ff'
    }

    const languageData = Object.entries(languageCount)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalRepos) * 100),
        color: languageColors[name] || '#8884d8'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 languages

    // Add "Other" category if there are more languages
    const topLanguagesTotal = languageData.reduce((sum, lang) => sum + lang.value, 0)
    if (topLanguagesTotal < 100) {
      languageData.push({
        name: 'Other',
        value: 100 - topLanguagesTotal,
        color: '#8884d8'
      })
    }

    return languageData
  }

  private calculateBehaviorFromEvents(events: any[]): any[] {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const behaviorData = daysOfWeek.map(day => ({
      day: day,
      commits: 0,
      issues: 0,
      prs: 0
    }))

    events.forEach(event => {
      const eventDate = new Date(event.created_at)
      const dayIndex = eventDate.getDay()

      switch (event.type) {
        case 'PushEvent':
          behaviorData[dayIndex].commits += event.payload?.commits?.length || 1
          break
        case 'IssuesEvent':
          behaviorData[dayIndex].issues += 1
          break
        case 'PullRequestEvent':
          behaviorData[dayIndex].prs += 1
          break
      }
    })
    return behaviorData
  }

  // Repository detailed analysis
  async getRepoAnalysis(owner: string, repo: string): Promise<{
    basic_info: TrendingRepo
    stats: {
      stars_history: Array<{ date: string; stars: number }>
      commits_history: Array<{ date: string; commits: number }>
      contributors_count: number
      languages: Record<string, number>
      issues_stats: {
        open: number
        closed: number
        avg_close_time: number
      }
      prs_stats: {
        open: number
        merged: number
        avg_merge_time: number
      }
    }
    health_score: number
    trend_analysis: {
      momentum: 'high' | 'medium' | 'low'
      activity_trend: 'increasing' | 'stable' | 'decreasing'
      community_engagement: 'high' | 'medium' | 'low'
    }
  }> {
    const endpoint = `/q/analyze-repo/${owner}/${repo}`
    return this.fetchWithCache(endpoint)
  }

  // Language ecosystem analysis
  async getLanguageEcosystem(language: string): Promise<{
    language: string
    total_repos: number
    total_stars: number
    top_repos: TrendingRepo[]
    trending_repos: TrendingRepo[]
    top_developers: TopContributor[]
    frameworks_libraries: Array<{
      name: string
      description: string
      stars: number
      category: string
    }>
    statistics: {
      repos_growth_rate: number
      stars_growth_rate: number
      new_repos_last_month: number
      active_developers: number
    }
  }> {
    const endpoint = `/q/language-ecosystem/${language}`
    return this.fetchWithCache(endpoint)
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache status
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // ============ ACTION ITEMS API METHODS ============

  // Get assigned issues and PRs for the authenticated user
  async getAssignedItems(username?: string): Promise<any[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for assigned items')
      return []
    }
    try {
      const user = username || '@me'
      const endpoint = `/search/issues?q=assignee:${user}+state:open&sort=updated&order=desc&per_page=50`
      const response = await this.fetchWithCache<any>(endpoint, true)

      return response.items?.map((item: any) => ({
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
        labels: item.labels?.map((l: any) => l.name) || [],
        assignedAt: item.created_at // Approximation
      })) || []
    } catch (error) {
      console.error('Failed to fetch assigned items:', error)
      return []
    }
  }

  // Get mentions and review requests for the authenticated user
  async getMentionItems(username?: string): Promise<any[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for mentions')
      return []
    }

    try {
      const user = username || '@me'
      // Get mentions in issues and PRs
      const mentionsEndpoint = `/search/issues?q=mentions:${user}+state:open&sort=updated&order=desc&per_page=25`
      const reviewRequestsEndpoint = `/search/issues?q=review-requested:${user}+state:open&sort=updated&order=desc&per_page=25`

      const [mentionsResponse, reviewsResponse] = await Promise.all([
        this.fetchWithCache<any>(mentionsEndpoint, true),
        this.fetchWithCache<any>(reviewRequestsEndpoint, true)
      ])

      const mentions = mentionsResponse.items?.map((item: any) => ({
        id: item.id,
        title: item.title,
        repo: item.repository_url.split('/').slice(-2).join('/'),
        type: item.pull_request ? 'pr' : 'issue',
        priority: this.calculatePriority(item),
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: item.user?.login,
        labels: item.labels?.map((l: any) => l.name) || [],
        mentionType: 'mention',
        mentionedAt: item.updated_at
      })) || []

      const reviews = reviewsResponse.items?.map((item: any) => ({
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
        labels: item.labels?.map((l: any) => l.name) || [],
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

  // Get stale PRs (older than 7 days without activity)
  async getStaleItems(username?: string, daysOld: number = 7): Promise<any[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for stale items')
      return []
    }

    try {
      const user = username || '@me'
      const date = new Date()
      date.setDate(date.getDate() - daysOld)
      const dateString = date.toISOString().split('T')[0]

      // Search for PRs authored by user that are still open and haven't been updated recently
      const endpoint = `/search/issues?q=author:${user}+type:pr+state:open+updated:<${dateString}&sort=updated&order=asc&per_page=50`
      const response = await this.fetchWithCache<any>(endpoint, true)

      return response.items?.map((item: any) => {
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
          labels: item.labels?.map((l: any) => l.name) || [],
          lastActivity: item.updated_at,
          daysStale,
          daysOld: daysStale,
          reviewStatus: 'pending' // We'd need additional API calls to get accurate review status
        }
      }) || []
    } catch (error) {
      console.error('Failed to fetch stale items:', error)
      return []
    }
  }

  // ============ QUICK WINS API METHODS ============

  // Good First Issues - Yeni başlayanlar için uygun issue'lar
  async getGoodFirstIssues(language?: string, limit = 20): Promise<any[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for good first issues')
      return []
    }

    try {
      let query = 'label:"good first issue" state:open'
      if (language) {
        query += ` language:${language}`
      }

      const endpoint = `/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${limit}`
      const response = await this.fetchWithCache<any>(endpoint, true)

      return response.items?.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        repo: issue.repository_url ? issue.repository_url.split('/').slice(-2).join('/') : 'unknown/unknown',
        type: 'issue',
        priority: this.calculatePriority(issue),
        url: issue.html_url,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        author: issue.user?.login,
        labels: issue.labels?.map((l: any) => l.name) || [],
        language: language || 'Unknown',
        stars: 0,
        comments: issue.comments || 0,
        difficulty: 'Easy'
      })) || []
    } catch (error) {
      console.error('Failed to fetch good first issues:', error)
      return []
    }
  }

  // Easy Fixes - Basit düzeltmeler (documentation, typos, etc.)
  async getEasyFixes(language?: string, limit = 20): Promise<any[]> {
    if (!this.githubToken) {
      console.warn('No GitHub token available for easy fixes')
      return []
    }

    try {
      const labels = ['documentation', 'typo', 'easy', 'beginner', 'help wanted']
      // Use parentheses to group OR label queries for GitHub search
      const labelQuery = labels.map(label => `label:\"${label}\"`).join(' OR ')
      let query = `(${labelQuery}) state:open`

      if (language) {
        query += ` language:${language}`
      }

      const endpoint = `/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${limit}`
      const response = await this.fetchWithCache<any>(endpoint, true)

      return response.items?.map((issue: any) => this.mapGitHubIssueToActionItem(issue, language)) || []
    } catch (error) {
      console.error('Failed to fetch easy fixes:', error)
      return []
    }
  }

  // Helper method to calculate priority based on issue/PR data
  private calculatePriority(item: any): 'low' | 'medium' | 'high' | 'urgent' {
    const labels = item.labels?.map((l: any) => l.name.toLowerCase()) || []
    const commentCount = item.comments || 0
    const daysSinceUpdate = Math.floor((Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24))

    // Check for priority labels
    if (labels.some((l: string) => l.includes('critical') || l.includes('urgent') || l.includes('p0'))) {
      return 'urgent'
    }
    if (labels.some((l: string) => l.includes('high') || l.includes('p1') || l.includes('bug'))) {
      return 'high'
    }
    if (labels.some((l: string) => l.includes('low') || l.includes('p3') || l.includes('enhancement'))) {
      return 'low'
    }

    // Priority based on activity
    if (commentCount > 10 || daysSinceUpdate < 1) {
      return 'high'
    }
    if (commentCount > 5 || daysSinceUpdate < 3) {
      return 'medium'
    }

    return 'low'
  }
}

// Singleton instance
export const ossInsightClient = new OSSInsightClient()

// Utility functions
export const formatTrendingData = (repos: TrendingRepo[]) => {
  return repos.map(repo => ({
    ...repo,
    trend_indicator: repo.stars_increment && repo.stars_increment > 0
      ? `+${repo.stars_increment} stars`
      : 'stable',
    growth_percentage: repo.stars_increment_percentage
      ? `${repo.stars_increment_percentage > 0 ? '+' : ''}${repo.stars_increment_percentage.toFixed(1)}%`
      : null,
    activity_score: calculateActivityScore(repo),
    health_score: calculateHealthScore(repo)
  }))
}

export const formatLanguageData = (languages: TopLanguage[]) => {
  return languages.map(lang => ({
    ...lang,
    trend_icon: lang.trend === 'rising' ? '📈' : lang.trend === 'declining' ? '📉' : '➡️',
    rank_change_text: lang.rank_change > 0
      ? `↗️ +${lang.rank_change}`
      : lang.rank_change < 0
        ? `↘️ ${lang.rank_change}`
        : '➡️ 0'
  }))
}

export const formatContributorData = (contributors: TopContributor[]) => {
  return contributors.map(contributor => ({
    ...contributor,
    impact_score: calculateImpactScore(contributor),
    specialization: getSpecialization(contributor.languages),
    growth_indicator: contributor.contributions_increment && contributor.contributions_increment > 0
      ? `+${contributor.contributions_increment} contributions`
      : 'stable'
  }))
}

// Helper functions
function calculateActivityScore(repo: TrendingRepo): number {
  const factors = [
    repo.commits_last_month || 0,
    repo.prs_last_month || 0,
    repo.issues_last_month || 0,
    repo.contributors_count || 0
  ]

  return Math.min(100, Math.round(factors.reduce((sum, factor) => sum + factor, 0) / 10))
}

function calculateHealthScore(repo: TrendingRepo): number {
  let score = 70 // Base score

  // Repository activity
  if (repo.commits_last_month && repo.commits_last_month > 10) score += 10
  if (repo.contributors_count && repo.contributors_count > 5) score += 10

  // Community engagement
  if (repo.stargazers_count > 1000) score += 10
  if (repo.forks_count > 100) score += 5
  if (repo.open_issues_count > 0 && repo.open_issues_count < 50) score += 5

  // Repository maintenance
  const lastUpdate = new Date(repo.updated_at)
  const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceUpdate < 7) score += 10
  else if (daysSinceUpdate < 30) score += 5

  // Documentation and setup
  if (repo.description && repo.description.length > 20) score += 5
  if (repo.topics && repo.topics.length > 0) score += 5
  if (repo.license) score += 5

  // Penalize archived or forked repos
  if (repo.archived) score -= 20
  if (repo.fork) score -= 10

  return Math.min(100, Math.max(0, score))
}



function calculateImpactScore(contributor: TopContributor): number {
  let score = 0

  // Contribution metrics
  score += Math.min(50, contributor.contributions / 10) // Max 50 points for contributions
  score += Math.min(20, contributor.repos_count * 2) // Max 20 points for repo count
  score += Math.min(20, contributor.stars_earned / 100) // Max 20 points for stars earned
  score += Math.min(10, contributor.followers_count / 100) // Max 10 points for followers

  return Math.min(100, Math.round(score))
}

function getSpecialization(languages: string[]): string {
  if (!languages || languages.length === 0) return 'General'

  const webLanguages = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'React', 'Angular']
  const backendLanguages = ['Java', 'Python', 'Go', 'C#', 'PHP', 'Ruby', 'Rust']
  const mobileLanguages = ['Swift', 'Kotlin', 'Dart', 'Objective-C']
  const systemLanguages = ['C', 'C++', 'Rust', 'Go', 'Assembly']
  const dataLanguages = ['Python', 'R', 'Julia', 'Scala', 'MATLAB']

  const webCount = languages.filter(lang => webLanguages.includes(lang)).length
  const backendCount = languages.filter(lang => backendLanguages.includes(lang)).length
  const mobileCount = languages.filter(lang => mobileLanguages.includes(lang)).length
  const systemCount = languages.filter(lang => systemLanguages.includes(lang)).length
  const dataCount = languages.filter(lang => dataLanguages.includes(lang)).length

  const maxCount = Math.max(webCount, backendCount, mobileCount, systemCount, dataCount)

  if (maxCount === 0) return 'General'
  if (maxCount === webCount) return 'Web Development'
  if (maxCount === backendCount) return 'Backend Development'
  if (maxCount === mobileCount) return 'Mobile Development'
  if (maxCount === systemCount) return 'Systems Programming'
  if (maxCount === dataCount) return 'Data Science'

  return 'Full Stack'
}


export const formatGitHubEvent = (event: GitHubEvent) => {
  const eventTypes: { [key: string]: string } = {
    'PushEvent': '📤 Push',
    'PullRequestEvent': '🔀 Pull Request',
    'IssuesEvent': '🐛 Issue',
    'ForkEvent': '🍴 Fork',
    'WatchEvent': '⭐ Star',
    'CreateEvent': '📝 Create',
    'ReleaseEvent': '🚀 Release'
  }

  return {
    ...event,
    type_icon: eventTypes[event.type] || '📋',
    formatted_time: formatRelativeTime(event.created_at),
    repo_name: event.repo.name.split('/').pop() || event.repo.name
  }
}

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'az önce'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`

  return date.toLocaleDateString('tr-TR')
}


export const aggregateLanguageStats = (languages: TopLanguage[]) => {
  const total = languages.reduce((sum, lang) => sum + lang.repos_count, 0)

  return languages.map(lang => ({
    ...lang,
    percentage: ((lang.repos_count / total) * 100).toFixed(1),
    growth_rate: lang.repos_increment ? ((lang.repos_increment / lang.repos_count) * 100).toFixed(1) : '0'
  }))
}

export const categorizeRepositories = (repos: TrendingRepo[]) => {
  const categories = {
    'Web Development': ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'React', 'Angular'],
    'Backend': ['Java', 'Python', 'Go', 'C#', 'PHP', 'Ruby', 'Rust'],
    'Mobile': ['Swift', 'Kotlin', 'Dart', 'Objective-C'],
    'Data Science': ['Python', 'R', 'Julia', 'Jupyter Notebook'],
    'DevOps': ['Shell', 'Dockerfile', 'HCL', 'Makefile'],
    'Systems': ['C', 'C++', 'Rust', 'Go', 'Assembly'],
    'Other': []
  }

  const categorized: Record<string, TrendingRepo[]> = {}

  Object.keys(categories).forEach(category => {
    categorized[category] = []
  })

  repos.forEach(repo => {
    let assigned = false

    for (const [category, languages] of Object.entries(categories) as [string, string[]][]) {
      if (category === 'Other') continue

      if (repo.language && languages.includes(repo.language)) {
        categorized[category].push(repo)
        assigned = true
        break
      }
    }

    if (!assigned) {
      categorized['Other'].push(repo)
    }
  })

  return categorized
}


export const handleAPIError = (error: any, context: string) => {
  console.error(`OSS Insight API Error in ${context}:`, error)

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { error: 'network', message: 'Ağ bağlantısı hatası' }
  }

  if (error.message.includes('404')) {
    return { error: 'not_found', message: 'Veri bulunamadı' }
  }

  if (error.message.includes('429')) {
    return { error: 'rate_limit', message: 'Çok fazla istek' }
  }

  return { error: 'unknown', message: 'Bilinmeyen hata' }
}
