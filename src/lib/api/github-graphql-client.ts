import type { GitHubIssue } from '@/types/quickWins'

interface GraphQLResponse<T> {
  data: T
  errors?: Array<{ message: string }>
}

interface RateLimit {
  limit: number
  cost: number
  remaining: number
  resetAt: string
}

interface SearchResult {
  search: {
    nodes: Issue[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string
    }
  }
  rateLimit: RateLimit
}

interface Issue {
  id: string
  title: string
  url: string
  createdAt: string
  updatedAt: string
  labels: {
    nodes: Array<{ name: string; color: string }>
  }
  repository: {
    name: string
    nameWithOwner: string
    stargazerCount: number | null
    primaryLanguage: { name: string } | null
    owner: {
      login: string
      avatarUrl: string
    }
  }
  author: {
    login: string
    avatarUrl: string
  } | null
  comments: {
    totalCount: number
  }
}

interface ActionRequiredResult {
  assigned: GitHubActionItem[]
  mentions: GitHubActionItem[]
  stale: GitHubActionItem[]
  rateLimit: RateLimit
}

interface GitHubActionItem {
  id: string
  title: string
  url: string
  repo: string
  type: 'issue' | 'pullRequest'
  author: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  daysOld: number
  createdAt: string
  updatedAt: string
  mentionType?: 'mention' | 'review_request' | 'comment'
}

interface ActionRequiredQueryResult {
  user: {
    assignedIssues: {
      nodes: ActionItem[]
    }
    pullRequests: {
      nodes: PullRequest[]
    }
  }
  stalePRs: {
    nodes: StalePullRequest[]
  }
  mentions: {
    nodes: (ActionItem | PullRequestWithReviews)[]
  }
  reviewRequests: {
    nodes: PullRequestWithReviews[]
  }
  rateLimit: RateLimit
}

interface ActionItem {
  id: string
  title: string
  url: string
  createdAt: string
  updatedAt: string
  repository: {
    nameWithOwner: string
  }
  author: {
    login: string
  } | null
  labels: {
    nodes: Array<{ name: string }>
  }
  __typename?: string
}

interface PullRequest {
  id: string
  title: string
  url: string
  createdAt: string
  updatedAt: string
  repository: {
    nameWithOwner: string
  }
  author: {
    login: string
  } | null
  assignees: {
    nodes: Array<{ login: string }>
  }
  labels: {
    nodes: Array<{ name: string }>
  }
  __typename?: string
}

interface PullRequestWithReviews extends PullRequest {
  reviewRequests: {
    nodes: Array<{
      requestedReviewer: {
        login: string
      } | null
    }>
  }
}

interface StalePullRequest extends Omit<PullRequest, 'assignees'> {
  reviewDecision: string | null
}

class GitHubGraphQLClient {
  private endpoint = 'https://api.github.com/graphql'
  private token = ''

  setToken(token: string) {
    this.token = token
  }

  private async query<T>(query: string, variables = {}): Promise<GraphQLResponse<T>> {
    if (!this.token) {
      throw new Error('GitHub token not set')
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v4+json'
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.data?.rateLimit) {
      if (typeof window !== 'undefined') {
        const updateRateLimit = (window as typeof window & { updateRateLimit?: (headers: Headers) => void }).updateRateLimit
        if (updateRateLimit) {
          const headers = new Headers()
          headers.set('x-ratelimit-remaining', data.data.rateLimit.remaining.toString())
          headers.set('x-ratelimit-limit', data.data.rateLimit.limit.toString())
          headers.set('x-ratelimit-reset', new Date(data.data.rateLimit.resetAt).getTime().toString())
          headers.set('x-ratelimit-used', (data.data.rateLimit.limit - data.data.rateLimit.remaining).toString())
          updateRateLimit(headers)
        }
      }
    }

    if (data.errors) {
      throw new Error(`GraphQL errors: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`)
    }

    return data
  }

  async getGoodFirstIssues(count = 100): Promise<GitHubIssue[]> {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const dateString = oneMonthAgo.toISOString().split('T')[0]
    
    const query = `
      query GetGoodFirstIssues($count: Int!) {
        search(
          query: "label:\\"good first issue\\" state:open created:>${dateString}", 
          type: ISSUE, 
          first: $count
        ) {
          nodes {
            ... on Issue {
              id
              title
              url
              createdAt
              updatedAt
              labels(first: 10) {
                nodes {
                  name
                  color
                }
              }
              repository {
                name
                nameWithOwner
                stargazerCount
                primaryLanguage {
                  name
                }
                owner {
                  login
                  avatarUrl
                }
              }
              author {
                login
                avatarUrl
              }
              comments {
                totalCount
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
    `

    try {
      const result = await this.query<SearchResult>(query, { 
        count
      })

      const filteredIssues = result.data.search.nodes
        .filter(issue => issue.repository?.stargazerCount && issue.repository.stargazerCount >= 5)
        .map(issue => this.mapIssueToGitHubIssue(issue))

      return filteredIssues
      
    } catch (error) {
      console.error('Failed to fetch good first issues via GraphQL:', error)
      throw error
    }
  }

 async getEasyFixes(count = 100): Promise<GitHubIssue[]> {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 3)
    const dateString = oneMonthAgo.toISOString().split('T')[0]
    
    const labels = ['beginner', 'easy', 'help wanted', 'good first issue']
    const allIssues: Issue[] = []
    
    for (const label of labels) {
        const query = `
          query GetEasyFixes($count: Int!) {
            search(
              query: "label:\\"${label}\\" state:open created:>${dateString}",
              type: ISSUE, 
              first: $count
            ) {
              nodes {
                ... on Issue {
                  id
                  title
                  url
                  createdAt
                  updatedAt
                  labels(first: 10) {
                    nodes {
                      name
                      color
                    }
                  }
                  repository {
                    name
                    nameWithOwner
                    stargazerCount
                    primaryLanguage {
                      name
                    }
                    owner {
                      login
                      avatarUrl
                    }
                  }
                  author {
                    login
                    avatarUrl
                  }
                  comments {
                    totalCount
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
            rateLimit {
              limit
              cost
              remaining
              resetAt
            }
          }
        `
        
        try {
            const result = await this.query<SearchResult>(query, { count: Math.max(1, Math.floor(count / labels.length)) })
            allIssues.push(...result.data.search.nodes)
            
            await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
            console.warn(`Search failed for label "${label}":`, error)
        }
    }
    
    const uniqueIssues = allIssues.filter((issue, index, self) => 
        index === self.findIndex(i => i.id === issue.id)
    )
    
    const filteredIssues = uniqueIssues
        .filter(issue => issue.repository?.stargazerCount && issue.repository.stargazerCount >= 5)
        .map(issue => this.mapIssueToGitHubIssue(issue))

    return filteredIssues
}

  private mapIssueToGitHubIssue(issue: Issue): GitHubIssue {
    const labels = issue.labels.nodes.map(l => ({ name: l.name, color: l.color }))
    
    return {
      id: parseInt(issue.id.replace('I_', ''), 10) || Math.random() * 1000000,
      title: issue.title,
      repository: issue.repository.nameWithOwner,
      repositoryUrl: `https://github.com/${issue.repository.nameWithOwner}`,
      url: issue.url,
      labels: labels,
      created_at: issue.createdAt,
      updated_at: issue.updatedAt,
      difficulty: 'easy' as const, 
      language: issue.repository.primaryLanguage?.name || 'unknown',
      stars: issue.repository.stargazerCount || 0,
      author: {
        login: issue.author?.login || 'unknown',
        avatar_url: issue.author?.avatarUrl || ''
      },
      comments: issue.comments.totalCount,
      state: 'open' as const,
      assignee: null, 
      priority: this.calculatePriority(labels.map(l => l.name), issue.comments.totalCount)
    }
  }

  private calculatePriority(labels: string[], commentCount: number): 'low' | 'medium' | 'high' {
    const lowerLabels = labels.map(l => l.toLowerCase())
    
    if (lowerLabels.some(l => l.includes('critical') || l.includes('urgent') || l.includes('p0'))) {
      return 'high'
    }
    if (lowerLabels.some(l => l.includes('high') || l.includes('p1') || l.includes('bug'))) {
      return 'high'
    }
    if (lowerLabels.some(l => l.includes('low') || l.includes('p3') || l.includes('enhancement'))) {
      return 'low'
    }
    
    if (commentCount > 10) return 'high'
    if (commentCount > 5) return 'medium'
    
    return 'low'
  }

  async checkRateLimit(): Promise<RateLimit> {
    const query = `
      query {
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
    `
    
    const result = await this.query<{ rateLimit: RateLimit }>(query)
    return result.data.rateLimit
  }

async getActionRequiredItems(username: string): Promise<ActionRequiredResult> {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const staleDate = oneWeekAgo.toISOString()

const query = `
    query GetActionRequiredItems($username: String!) {
      user(login: $username) {
        # Assigned Issues & PRs
        assignedIssues: issues(states: OPEN, first: 50, filterBy: { assignee: $username }) {
          nodes {
            __typename
            id
            title
            url
            createdAt
            updatedAt
            repository {
              nameWithOwner
            }
            author {
              login
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
          }
        }
        # Assigned Pull Requests 
        pullRequests(states: OPEN, first: 50) {
          nodes {
            __typename
            id
            title
            url
            createdAt
            updatedAt
            repository {
              nameWithOwner
            }
            author {
              login
            }
            assignees(first: 10) {
              nodes {
                login
              }
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
          }
        }
      }
      # Stale PRs
      stalePRs: search(
        query: "is:pr is:open author:${username} updated:<${staleDate}"
        type: ISSUE
        first: 50
      ) {
        nodes {
          ... on PullRequest {
            __typename
            id
            title
            url
            createdAt
            updatedAt
            repository {
              nameWithOwner
            }
            author {
              login
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
            reviewDecision
          }
        }
      }
      # Mentions and Review Requests
      mentions: search(
        query: "mentions:${username} is:open"
        type: ISSUE  
        first: 50
      ) {
        nodes {
          ... on Issue {
            __typename
            id
            title
            url
            createdAt
            updatedAt
            repository {
              nameWithOwner
            }
            author {
              login
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
          }
          ... on PullRequest {
            __typename
            id
            title
            url
            createdAt
            updatedAt
            repository {
              nameWithOwner
            }
            author {
              login
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
            reviewRequests(first: 10) {
              nodes {
                requestedReviewer {
                  ... on User {
                    login
                  }
                }
              }
            }
          }
        }
      }
      # Review Requests (separate query for better detection)
      reviewRequests: search(
        query: "is:pr is:open review-requested:${username}"
        type: ISSUE
        first: 50
      ) {
        nodes {
          ... on PullRequest {
            __typename
            id
            title
            url
            createdAt
            updatedAt
            repository {
              nameWithOwner
            }
            author {
              login
            }
            labels(first: 10) {
              nodes {
                name
              }
            }
            reviewRequests(first: 10) {
              nodes {
                requestedReviewer {
                  ... on User {
                    login
                  }
                }
              }
            }
          }
        }
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }
  `
  
  try {
    const result = await this.query<ActionRequiredQueryResult>(query, { 
      username
    })

    const data = result.data
    
    const assignedIssues = data.user.assignedIssues.nodes.map((item: ActionItem) => this.mapToActionItem(item))
    const assignedPRs = data.user.pullRequests.nodes
      .filter((pr: PullRequest) => pr.assignees.nodes.some((assignee: { login: string }) => assignee.login === username))
      .map((item: PullRequest) => this.mapToActionItem(item))
    const assigned = [...assignedIssues, ...assignedPRs]

    const reviewRequestIds = new Set<string>()
    const reviewRequests = data.reviewRequests.nodes
      .filter((pr: PullRequestWithReviews) => 
        pr.reviewRequests.nodes.some(req => req.requestedReviewer?.login === username)
      )
      .map((item: PullRequestWithReviews) => {
        reviewRequestIds.add(item.id)
        return this.mapToActionItem(item, 'review_request')
      })

    const generalMentions = data.mentions.nodes
      .filter((item) => !reviewRequestIds.has(item.id))
      .map((item: ActionItem | PullRequestWithReviews) => {
       
        const mentionType = item.__typename === 'PullRequest' ? 'comment' : 'mention'
        return this.mapToActionItem(item, mentionType)
      })

    const mentions = [...reviewRequests, ...generalMentions]

    const stale = data.stalePRs.nodes.map((pr: StalePullRequest) => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(pr.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        ...this.mapToActionItem(pr),
        daysOld: daysSinceUpdate,
        reviewStatus: pr.reviewDecision || 'PENDING',
      }
    })

    return {
      assigned,
      mentions, 
      stale,
      rateLimit: data.rateLimit
    }

  } catch (error) {
    console.error('Failed to fetch action required items:', error)
    throw error
  }
}

private mapToActionItem(item: ActionItem | PullRequest | StalePullRequest | PullRequestWithReviews, mentionType?: 'mention' | 'review_request' | 'comment'): GitHubActionItem {
  const daysOld = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const labels = item.labels?.nodes?.map((l: { name: string }) => l.name) || []
  
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    repo: item.repository.nameWithOwner,
    type: item.__typename === 'PullRequest' ? 'pullRequest' : 'issue',
    author: item.author?.login || 'unknown',
    priority: this.calculateActionPriority(labels, daysOld),
    daysOld,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    ...(mentionType && { mentionType })
  }
}


private calculateActionPriority(labels: string[], daysOld: number): 'urgent' | 'high' | 'medium' | 'low' {
  const lowerLabels = labels.map(l => l.toLowerCase())
  

  if (lowerLabels.some(l => l.includes('critical') || l.includes('urgent') || l.includes('p0'))) {
    return 'urgent'
  }
  if (lowerLabels.some(l => l.includes('high') || l.includes('p1') || l.includes('bug'))) {
    return 'high'
  }
  

  if (daysOld > 14) return 'urgent'  
  if (daysOld > 7) return 'high'     
  if (daysOld > 3) return 'medium'   
  
  return 'low'
} 


}

export const githubGraphQLClient = new GitHubGraphQLClient()