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
    stargazerCount: number
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
        const updateRateLimit = (window as any).updateRateLimit
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
      throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`)
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
        .filter(issue => issue.repository.stargazerCount >= 5)
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
    let allIssues: Issue[] = []
    
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
            const result = await this.query<SearchResult>(query, { count: 25 })
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
        .filter(issue => issue.repository?.stargazerCount >= 5)
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
      stars: issue.repository.stargazerCount,
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
}

export const githubGraphQLClient = new GitHubGraphQLClient()