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