export const GITHUB_API_BASE = 'https://api.github.com'

export const ENDPOINTS = {
  ORG: (orgName: string) => `orgs/${orgName}`,
  USER: (userName: string) => `users/${userName}`,
  ORG_REPOS: (orgName: string) => `orgs/${orgName}/repos?per_page=100&sort=updated`,
  USER_REPOS: (userName: string) => `users/${userName}/repos?per_page=100&sort=updated`,
  REPO_COMMITS: (owner: string, repo: string) => `repos/${owner}/${repo}/commits?per_page=100`,
  REPO_CONTRIBUTORS: (owner: string, repo: string) => `repos/${owner}/${repo}/contributors?per_page=100`,
  REPO_ISSUES: (owner: string, repo: string) => `repos/${owner}/${repo}/issues?per_page=100&state=all`
} as const