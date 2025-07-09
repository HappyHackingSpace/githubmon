// GitHub Repository & User Types (Legacy + New Combined)
export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  private: boolean
  updated_at: string
}

export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions?: number
}

export interface ContributorWithRepos extends GitHubUser {
  repos?: string[]
}

export interface GitHubCommit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: GitHubUser | null
}

// GitHub Issues & Pull Requests
export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  user: {
    id: number
    login: string
    avatar_url: string
    html_url: string
  }
  created_at: string
  updated_at: string
  closed_at: string | null
  html_url: string
  labels: Array<{
    id: number
    name: string
    color: string
  }>
  pull_request?: {
    url: string
    html_url: string
    diff_url: string
    patch_url: string
  }
  repoName?: string
}

// Enhanced GitHub API Types (More Complete)
export interface GitHubUserDetailed {
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

export interface GitHubRepositoryDetailed {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: GitHubUserDetailed
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

// GitHub Search Responses
export interface GitHubSearchResponse<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

// GitHub Events
export interface GitHubEventPayload {
  // PushEvent
  push_id?: number
  size?: number
  distinct_size?: number
  ref?: string
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
  
  // ForkEvent
  forkee?: GitHubRepositoryDetailed
  
  // CreateEvent
  
  ref_type?: 'repository' | 'branch' | 'tag'
  master_branch?: string
  description?: string
  pusher_type?: 'user'
}

export interface GitHubEventDetailed {
  id: string
  type: string
  actor: GitHubUserDetailed
  repo: {
    id: number
    name: string
    url: string
  }
  payload: GitHubEventPayload
  public: boolean
  created_at: string
  org?: GitHubUserDetailed
}

// GitHub Rate Limiting
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

// API Headers
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

// Utility Types
export type GitHubEventType = 
  | 'PushEvent' 
  | 'PullRequestEvent' 
  | 'IssuesEvent' 
  | 'ForkEvent' 
  | 'WatchEvent' 
  | 'CreateEvent'
  | 'DeleteEvent'
  | 'ReleaseEvent'
  | 'PublicEvent'
  | 'MemberEvent'

export type GitHubUserType = 'User' | 'Organization'
export type GitHubRepoVisibility = 'public' | 'private'
export type GitHubIssueState = 'open' | 'closed'
export type GitHubPRState = 'open' | 'closed' | 'merged'