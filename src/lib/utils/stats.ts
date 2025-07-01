import { GitHubRepo, GitHubUser, GitHubCommit } from '@/types/github'

export function calculateRepoStats(repositories: GitHubRepo[]) {
  return {
    total: repositories.length,
    private: repositories.filter(repo => repo.private).length,
    public: repositories.filter(repo => !repo.private).length,
    totalStars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: repositories.reduce((sum, repo) => sum + repo.forks_count, 0),
    totalIssues: repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0),
    languages: getTopLanguages(repositories),
    mostStarred: repositories.sort((a, b) => b.stargazers_count - a.stargazers_count)[0]
  }
}

export function calculateContributorStats(contributors: GitHubUser[]) {
  const totalContributions = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0)
  const activeContributors = contributors.filter(c => (c.contributions || 0) > 5)
  
  return {
    total: contributors.length,
    active: activeContributors.length,
    totalContributions,
    topContributor: contributors.sort((a, b) => (b.contributions || 0) - (a.contributions || 0))[0]
  }
}

export function aggregateCommitsByDate(commits: GitHubCommit[], days: number = 30): Record<string, number> {
  const commitCounts: Record<string, number> = {}
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    commitCounts[dateString] = 0
  }
  
  commits.forEach(commit => {
    const commitDate = commit.commit.author.date.split('T')[0]
    if (commitCounts[commitDate] !== undefined) {
      commitCounts[commitDate]++
    }
  })
  
  return commitCounts
}

function getTopLanguages(repositories: GitHubRepo[], limit: number = 5) {
  const languageCounts: Record<string, number> = {}
  
  repositories.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  })
  
  return Object.entries(languageCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([language, count]) => ({ language, count }))
}