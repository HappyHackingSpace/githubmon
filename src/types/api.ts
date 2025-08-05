// GitHub API Response Types
export interface GitHubUser {
  id: number
  login: string
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User' | 'Organization'
  site_admin: boolean
  name?: string
  company?: string
  blog?: string
  location?: string
  email?: string
  hireable?: boolean
  bio?: string
  twitter_username?: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: GitHubUser
  html_url: string
  description: string | null
  fork: boolean
  url: string
  archive_url: string
  assignees_url: string
  blobs_url: string
  branches_url: string
  collaborators_url: string
  comments_url: string
  commits_url: string
  compare_url: string
  contents_url: string
  contributors_url: string
  deployments_url: string
  downloads_url: string
  events_url: string
  forks_url: string
  git_commits_url: string
  git_refs_url: string
  git_tags_url: string
  git_url: string
  issue_comment_url: string
  issue_events_url: string
  issues_url: string
  keys_url: string
  labels_url: string
  languages_url: string
  merges_url: string
  milestones_url: string
  notifications_url: string
  pulls_url: string
  releases_url: string
  ssh_url: string
  stargazers_url: string
  statuses_url: string
  subscribers_url: string
  subscription_url: string
  tags_url: string
  teams_url: string
  trees_url: string
  clone_url: string
  mirror_url: string | null
  hooks_url: string
  svn_url: string
  homepage: string | null
  language: string | null
  forks_count: number
  stargazers_count: number
  watchers_count: number
  size: number
  default_branch: string
  open_issues_count: number
  is_template: boolean
  topics: string[]
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  has_pages: boolean
  has_downloads: boolean
  archived: boolean
  disabled: boolean
  visibility: 'public' | 'private'
  pushed_at: string
  created_at: string
  updated_at: string
  permissions?: {
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
  license: {
    key: string
    name: string
    spdx_id: string
    url: string | null
    node_id: string
  } | null
}

export interface GitHubSearchResponse<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

export interface GitHubRateLimit {
  limit: number
  remaining: number
  reset: number
  used: number
  resource: string
}

export interface GitHubRateLimitResponse {
  resources: {
    core: GitHubRateLimit
    search: GitHubRateLimit
    graphql: GitHubRateLimit
    integration_manifest: GitHubRateLimit
    source_import: GitHubRateLimit
    code_scanning_upload: GitHubRateLimit
    actions_runner_registration: GitHubRateLimit
    scim: GitHubRateLimit
    dependency_snapshots: GitHubRateLimit
  }
  rate: GitHubRateLimit
}

// GitHub Events API Types
export interface GitHubEventPayload {
  // PushEvent
  push_id?: number
  size?: number
  distinct_size?: number

  head?: string
  before?: string
  commits?: Array<{
    sha: string
    author: {
      email: string
      name: string
    }
    message: string
    distinct: boolean
    url: string
  }>
  
  // PullRequestEvent
  action?: 'opened' | 'closed' | 'synchronize' | 'reopened'
  number?: number
  pull_request?: {
    id: number
    number: number
    state: 'open' | 'closed'
    title: string
    user: GitHubUser
    body: string
    created_at: string
    updated_at: string
    closed_at: string | null
    merged_at: string | null
    head: {
      label: string
      ref: string
      sha: string
    }
    base: {
      label: string
      ref: string
      sha: string
    }
  }
  
  // IssuesEvent
  issue?: {
    id: number
    number: number
    title: string
    user: GitHubUser
    state: 'open' | 'closed'
    created_at: string
    updated_at: string
    closed_at: string | null
    body: string
  }
  
  // WatchEvent
  // No additional payload
  
  // ForkEvent
  forkee?: GitHubRepository
  
  // CreateEvent
  ref?: string
  ref_type?: 'repository' | 'branch' | 'tag'
  master_branch?: string
  description?: string
  pusher_type?: 'user'
}

export interface GitHubEvent {
  id: string
  type: string
  actor: GitHubUser
  repo: {
    id: number
    name: string
    url: string
  }
  payload: GitHubEventPayload
  public: boolean
  created_at: string
  org?: GitHubUser
}

// Request/Response Headers
export interface GitHubAPIHeaders {
  'Authorization'?: string
  'Accept': string
  'User-Agent'?: string
  'X-GitHub-Api-Version'?: string
}

export interface GitHubResponseHeaders {
  'x-ratelimit-limit': string
  'x-ratelimit-remaining': string
  'x-ratelimit-reset': string
  'x-ratelimit-used': string
  'x-ratelimit-resource': string
  'link'?: string
  'last-modified'?: string
  'etag'?: string
}

// Client Configuration
export interface GitHubClientConfig {
  token?: string
  baseUrl?: string
  timeout?: number
  retries?: number
  userAgent?: string
}

// Generic API Types
export interface APIClient {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T>
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T>
}

export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  timeout?: number
  retries?: number
  cache?: boolean
}

export interface APIResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}

export interface APIError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

// Pagination Types
export interface PaginationParams {
  page?: number
  per_page?: number
  since?: string
  until?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total_count?: number
    has_next: boolean
    has_prev: boolean
    next_page?: number
    prev_page?: number
  }
  links?: {
    first?: string
    prev?: string
    next?: string
    last?: string
  }
}

// Cache Types
export interface CacheStrategy {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

export interface MemoryCacheEntry<T> {
  value: T
  expiresAt: number
  createdAt: number
}

export interface CacheStats {
  hits: number
  misses: number
  entries: number
  size: number
}

// Utility Types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type ResponseFormat = 'json' | 'text' | 'blob' | 'arrayBuffer'

export interface RetryConfig {
  attempts: number
  delay: number
  backoff: 'linear' | 'exponential'
  retryCondition: (error: APIError) => boolean
}