export interface TrendingRepo {
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
  license?: {
    key: string
    name: string
  }
  topics: string[]
  owner: {
    login: string
    avatar_url: string
    type: string
  }

  stars_increment?: number
  stars_increment_percentage?: number
  forks_increment?: number
  contributors_count?: number
  commits_last_month?: number
  prs_last_month?: number
  issues_last_month?: number
}

export interface TopLanguage {
  language: string
  repos_count: number
  stars_count: number
  developers_count: number
  repos_increment?: number
  stars_increment?: number
  percentage_of_total: number
  trend: 'rising' | 'stable' | 'declining'
  rank: number
  rank_change: number
}

export interface GitHubEvent {
  id: string
  type: 'PushEvent' | 'PullRequestEvent' | 'IssuesEvent' | 'ForkEvent' | 'WatchEvent' | 'CreateEvent'
  actor: {
    login: string
    display_login: string
    avatar_url: string
    url: string
  }
  repo: {
    name: string
    url: string
  }
  payload: any
  created_at: string
  public: boolean
}

export interface TopContributor {
  login: string
  name?: string
  avatar_url: string
  html_url: string
  contributions: number
  repos_count: number
  stars_earned: number
  followers_count: number
  languages: string[]
  type: 'User' | 'Organization'
  bio?: string
  location?: string
  company?: string
  blog?: string
  contributions_increment?: number
  rank: number
  rank_change: number
}

export interface HotCollection {
  id: string
  name: string
  description: string
  repos_count: number
  total_stars: number
  featured_repos: Array<{
    full_name: string
    description: string
    stars: number
    language: string
  }>
  tags: string[]
  created_at: string
  updated_at: string
}

export interface RepoStats {
  total_repos: number
  total_stars: number
  total_forks: number
  total_commits_last_month: number
  active_repos_count: number
  new_repos_last_month: number
  trending_repos_count: number
  languages_count: number
  developers_count: number
  // top_repo was removed in the API—use top_repos: TrendingRepo[] instead.
}

// Formatted data types for UI components
export interface FormattedTrendingRepo extends TrendingRepo {
  trend_indicator: string
  growth_percentage: string | null
  activity_score: number
  health_score: number
}

export interface FormattedLanguage extends TopLanguage {
  trend_icon: string
  rank_change_text: string
  percentage: string
  growth_rate: string
}

export interface FormattedContributor extends TopContributor {
  impact_score: number
  specialization: string
  growth_indicator: string
}

export interface FormattedEvent extends GitHubEvent {
  type_icon: string
  formatted_time: string
  repo_name: string
}

// Search related types
export interface SearchFilters {
  type: 'repos' | 'users' | 'orgs'
  sort: 'stars' | 'forks' | 'updated'
  period: '24h' | '7d' | '30d'
  language?: string
}

export interface SearchResult<T> {
  items: T[]
  total_count: number
  incomplete_results: boolean
}

// API Response types
export interface APIResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
  cached?: boolean
}

export interface OSSInsightSQLResponse {
  type: 'sql_endpoint'
  data: {
    columns: Array<{
      col: string
      data_type: string
      nullable: boolean
    }>
    rows: any[]
    result: {
      code: number
      message: string
      start_ms: number
      end_ms: number
      latency: string
      row_count: number
      row_affect: number
      limit: number
      databases: string[]
    }
  }
}

// Component Props types
export interface TrendingReposProps {
  period: '24h' | '7d' | '30d'
  limit?: number
  showPeriodSelector?: boolean
  className?: string
}

export interface TopLanguagesProps {
  period: '7d' | '30d' | '90d'
  limit?: number
  showTrends?: boolean
  className?: string
}

export interface PlatformStatsProps {
  animated?: boolean
  showGrowth?: boolean
  className?: string
}

export interface SearchSectionProps {
  onSearch: (query: string, filters: SearchFilters) => void
  loading?: boolean
  placeholder?: string
  className?: string
}

// Hook return types
export interface UseOSSInsightReturn {
  trendingRepos: TrendingRepo[]
  topLanguages: TopLanguage[]
  recentEvents: GitHubEvent[]
  topContributors: TopContributor[]
  platformStats: RepoStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export interface UseSearchReturn<T> {
  results: T[]
  loading: boolean
  error: string | null
  search: (query: string, filters?: Partial<SearchFilters>) => Promise<void>
  clear: () => void
}

// Utility types
export type TrendDirection = 'rising' | 'stable' | 'declining'
export type TimePeriod = '24h' | '7d' | '30d' | '90d'
export type SortOption = 'stars' | 'forks' | 'updated' | 'created'
export type SearchType = 'repos' | 'users' | 'orgs'

// Error types
export interface APIError {
  type: 'network' | 'not_found' | 'rate_limit' | 'unauthorized' | 'unknown'
  message: string
  details?: any
}

// Cache types
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxEntries: number
}