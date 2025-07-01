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