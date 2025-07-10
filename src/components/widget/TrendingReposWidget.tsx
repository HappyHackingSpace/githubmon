'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TrendingRepo } from '@/types/oss-insight'

interface TrendingReposWidgetProps {
  repos: TrendingRepo[]
  period: '24h' | '7d' | '30d'
  category: 'all' | 'ai-ml' | 'web-dev' | 'devops' | 'mobile'
}

interface CategorizedRepo extends TrendingRepo {
  category: string
  growthRate: number
  healthScore: number
  momentumIcon: string
  trendIcon: string
}

const CATEGORY_MAPPINGS = {
  'ai-ml': {
    languages: ['Python', 'Jupyter Notebook', 'R', 'Julia', 'CUDA', 'C++'],
    keywords: ['machine-learning', 'ai', 'neural', 'deep-learning', 'tensorflow', 'pytorch', 'model', 'dataset'],
    icon: '🤖',
    color: 'text-purple-600'
  },
  'web-dev': {
    languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'React', 'Angular', 'Svelte'],
    keywords: ['web', 'frontend', 'backend', 'fullstack', 'framework', 'component', 'app'],
    icon: '🌐',
    color: 'text-blue-600'
  },
  'devops': {
    languages: ['Shell', 'Dockerfile', 'HCL', 'Makefile', 'YAML', 'Go'],
    keywords: ['docker', 'kubernetes', 'devops', 'ci-cd', 'deployment', 'infrastructure', 'cloud'],
    icon: '⚙️',
    color: 'text-green-600'
  },
  'mobile': {
    languages: ['Swift', 'Kotlin', 'Dart', 'Java', 'Objective-C', 'Flutter'],
    keywords: ['mobile', 'ios', 'android', 'flutter', 'react-native', 'app'],
    icon: '📱',
    color: 'text-indigo-600'
  }
}

export function TrendingReposWidget({ repos, period, category }: TrendingReposWidgetProps) {
  const [sortBy, setSortBy] = useState<'growth' | 'stars' | 'health'>('growth')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // ❌ Sadece liste → ✅ Kategorilere ayır + büyüme analizi
  const categorizedRepos = useMemo(() => {
    return repos.map((repo): CategorizedRepo => {
      // Determine category
      let repoCategory = 'other'
      for (const [catKey, catData] of Object.entries(CATEGORY_MAPPINGS)) {
        const languageMatch = repo.language && catData.languages.includes(repo.language)
        const keywordMatch = catData.keywords.some(keyword => 
          repo.name.toLowerCase().includes(keyword) || 
          (repo.description?.toLowerCase().includes(keyword) ?? false) ||
          repo.topics.some(topic => topic.includes(keyword))
        )
        
        if (languageMatch || keywordMatch) {
          repoCategory = catKey
          break
        }
      }

      // Calculate growth rate (mock calculation based on stars and period)
      const baseGrowth = period === '24h' ? 0.1 : period === '7d' ? 0.5 : 2.0
      const starsFactor = Math.log10(repo.stargazers_count + 1) / 5
      const issuesFactor = repo.open_issues_count > 0 ? 0.2 : -0.1
      const forksFactor = Math.log10(repo.forks_count + 1) / 10
      
      const growthRate = Math.max(0, Math.min(500, 
        baseGrowth * 100 + starsFactor * 50 + issuesFactor * 100 + forksFactor * 20 + 
        (Math.random() - 0.5) * 50
      ))

      // Calculate health score
      let healthScore = 60 // Base score
      if (repo.description && repo.description.length > 20) healthScore += 10
      if (repo.topics && repo.topics.length > 0) healthScore += 10
      if (repo.language) healthScore += 5
      if (!repo.archived) healthScore += 10
      if (repo.open_issues_count > 0 && repo.open_issues_count < 50) healthScore += 10
      if (repo.forks_count > repo.stargazers_count * 0.1) healthScore += 5

      // Momentum and trend icons
      const momentumIcon = growthRate > 100 ? '🚀' : growthRate > 50 ? '📈' : growthRate > 20 ? '⬆️' : '➡️'
      const trendIcon = healthScore > 85 ? '💚' : healthScore > 70 ? '💛' : '🔴'

      return {
        ...repo,
        category: repoCategory,
        growthRate: Math.round(growthRate),
        healthScore,
        momentumIcon,
        trendIcon
      }
    })
  }, [repos, period])

  // Filter by category
  const filteredRepos = useMemo(() => {
    if (category === 'all') return categorizedRepos
    return categorizedRepos.filter(repo => repo.category === category)
  }, [categorizedRepos, category])

  // Sort repos
  const sortedRepos = useMemo(() => {
    return [...filteredRepos].sort((a, b) => {
      switch (sortBy) {
        case 'growth': return b.growthRate - a.growthRate
        case 'stars': return b.stargazers_count - a.stargazers_count
        case 'health': return b.healthScore - a.healthScore
        default: return 0
      }
    })
  }, [filteredRepos, sortBy])

  const getCategoryInfo = (cat: string) => {
    return CATEGORY_MAPPINGS[cat as keyof typeof CATEGORY_MAPPINGS] || { icon: '📦', color: 'text-gray-600' }
  }

  const formatGrowthRate = (rate: number) => {
    if (rate > 200) return `🔥 +${rate}%`
    if (rate > 100) return `📈 +${rate}%`
    if (rate > 50) return `⬆️ +${rate}%`
    return `+${rate}%`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            🔥 Trending Repositories
            <Badge variant="outline">{sortedRepos.length} repos</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: 'growth' | 'stars' | 'health') => setSortBy(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">🚀 Growth Rate</SelectItem>
                <SelectItem value="stars">⭐ Stars</SelectItem>
                <SelectItem value="health">💚 Health Score</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              ☰
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedRepos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>No repositories found for the selected category</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'
          }>
            {sortedRepos.slice(0, 12).map((repo, index) => {
              const categoryInfo = getCategoryInfo(repo.category)
              
              if (viewMode === 'list') {
                return (
                  <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-8 h-8 rounded-full" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <a href={repo.html_url} target="_blank" className="font-medium text-indigo-600 hover:text-indigo-800 truncate">
                            {repo.full_name}
                          </a>
                          <span className={`text-sm ${categoryInfo.color}`}>{categoryInfo.icon}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{repo.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{formatGrowthRate(repo.growthRate)}</div>
                        <div className="text-gray-500">growth</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">⭐ {repo.stargazers_count.toLocaleString()}</div>
                        <div className="text-gray-500">stars</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{repo.trendIcon} {repo.healthScore}%</div>
                        <div className="text-gray-500">health</div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Card key={repo.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-7 h-7 rounded-full" />
                        <span className={`text-lg ${categoryInfo.color}`}>{categoryInfo.icon}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{repo.momentumIcon}</span>
                        <span className="text-lg">{repo.trendIcon}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <a href={repo.html_url} target="_blank" className="font-semibold text-indigo-600 hover:text-indigo-800 group-hover:underline text-sm">
                        {repo.full_name}
                      </a>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {repo.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Growth Rate - Prominently displayed */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Growth Rate:</span>
                        <Badge variant={repo.growthRate > 100 ? 'default' : 'secondary'} className="text-xs">
                          {formatGrowthRate(repo.growthRate)}
                        </Badge>
                      </div>
                      
                      {/* Traditional metrics */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">⭐ {repo.stargazers_count.toLocaleString()}</span>
                        <span className="text-gray-500">🍴 {repo.forks_count.toLocaleString()}</span>
                        {repo.language && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {repo.language}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Health Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Health:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                repo.healthScore > 85 ? 'bg-green-500' : 
                                repo.healthScore > 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${repo.healthScore}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{repo.healthScore}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Category Summary */}
        {category === 'all' && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📊 Category Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(CATEGORY_MAPPINGS).map(([key, data]) => {
                const count = categorizedRepos.filter(r => r.category === key).length
                const avgGrowth = count > 0 
                  ? Math.round(categorizedRepos.filter(r => r.category === key).reduce((sum, r) => sum + r.growthRate, 0) / count)
                  : 0
                
                return (
                  <div key={key} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-lg">{data.icon}</div>
                    <div className="text-xs font-medium capitalize">{key.replace('-', '/')}</div>
                    <div className="text-xs text-gray-500">{count} repos</div>
                    {count > 0 && (
                      <div className="text-xs text-green-600 font-medium">+{avgGrowth}% avg</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {sortedRepos.length > 12 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All {sortedRepos.length} Repositories →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}