'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TrendingRepo } from '@/types/oss-insight'
import { Rocket, LineChart, TrendingUp, ArrowUpRight, ArrowRight, Heart, AlertCircle, Package, Flame, Star, BarChart, Globe, Cog, Smartphone, Bot } from 'lucide-react'

interface TrendingReposWidgetProps {
  repos: TrendingRepo[]
  period: '24h' | '7d' | '30d'
  category: 'all' | 'ai-ml' | 'web-dev' | 'devops' | 'mobile'
}

interface CategorizedRepo extends TrendingRepo {
  category: string
  growthRate: number
  healthScore: number
  momentumIcon: React.ReactNode
  trendIcon: React.ReactNode
}

const CATEGORY_MAPPINGS = {
  'ai-ml': {
    languages: ['Python', 'Jupyter Notebook', 'R', 'Julia', 'CUDA', 'C++'],
    keywords: ['machine-learning', 'ai', 'neural', 'deep-learning', 'tensorflow', 'pytorch', 'model', 'dataset'],
    icon: <Bot className="w-4 h-4" />, // Lucide Bot icon
    color: 'text-purple-600'
  },
  'web-dev': {
    languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'React', 'Angular', 'Svelte'],
    keywords: ['web', 'frontend', 'backend', 'fullstack', 'framework', 'component', 'app'],
    icon: <Globe className="w-4 h-4" />, // Lucide Globe icon
    color: 'text-blue-600'
  },
  'devops': {
    languages: ['Shell', 'Dockerfile', 'HCL', 'Makefile', 'YAML', 'Go'],
    keywords: ['docker', 'kubernetes', 'devops', 'ci-cd', 'deployment', 'infrastructure', 'cloud'],
    icon: <Cog className="w-4 h-4" />, // Lucide Cog icon
    color: 'text-green-600'
  },
  'mobile': {
    languages: ['Swift', 'Kotlin', 'Dart', 'Java', 'Objective-C', 'Flutter'],
    keywords: ['mobile', 'ios', 'android', 'flutter', 'react-native', 'app'],
    icon: <Smartphone className="w-4 h-4" />, // Lucide Smartphone icon
    color: 'text-indigo-600'
  }
}

export function TrendingReposWidget({ repos, period, category }: TrendingReposWidgetProps) {
  const [sortBy, setSortBy] = useState<'growth' | 'stars' | 'health'>('growth')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getMomentumIcon = (growthRate: number) => {
    if (growthRate > 100) return <Rocket className="w-4 h-4 text-orange-500" />
    if (growthRate > 50) return <LineChart className="w-4 h-4 text-blue-500" />
    if (growthRate > 20) return <ArrowUpRight className="w-4 h-4 text-green-500" />
    return <ArrowRight className="w-4 h-4 text-muted-foreground" />
  }
  const getTrendIcon = (healthScore: number) => {
    if (healthScore > 85) return <Heart className="w-4 h-4 text-green-500" />
    if (healthScore > 70) return <BarChart className="w-4 h-4 text-yellow-500" />
    return <AlertCircle className="w-4 h-4 text-red-500" />
  }

  // Categorize and analyze growth
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
      const momentumIcon = getMomentumIcon(growthRate)
      const trendIcon = getTrendIcon(healthScore)

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
    return CATEGORY_MAPPINGS[cat as keyof typeof CATEGORY_MAPPINGS] || { icon: <Package className="w-4 h-4" />, color: 'text-muted-foreground' }
  }

  const formatGrowthRate = (rate: number) => {
    if (rate > 200) return <span className="inline-flex items-center gap-1 text-orange-600"><Flame className="w-4 h-4" />+{rate}%</span>
    if (rate > 100) return <span className="inline-flex items-center gap-1 text-blue-600"><LineChart className="w-4 h-4" />+{rate}%</span>
    if (rate > 50) return <span className="inline-flex items-center gap-1 text-green-600"><ArrowUpRight className="w-4 h-4" />+{rate}%</span>
    return `+${rate}%`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" /> Trending Repositories
            <Badge variant="outline">{sortedRepos.length} repos</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: 'growth' | 'stars' | 'health') => setSortBy(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth"><Rocket className="w-4 h-4 inline" /> Growth Rate</SelectItem>
                <SelectItem value="stars"><Star className="w-4 h-4 inline" /> Stars</SelectItem>
                <SelectItem value="health"><Heart className="w-4 h-4 inline text-green-500" /> Health Score</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Package className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <BarChart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {sortedRepos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
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
                  <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors overflow-hidden">
                    <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
                      <span className="text-lg font-bold text-muted-foreground flex-shrink-0">#{index + 1}</span>
                      <Avatar className="size-8 flex-shrink-0">
                        <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
                        <AvatarFallback className="text-xs">
                          {repo.owner.login.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <a href={repo.html_url} target="_blank" className="font-medium text-primary hover:text-primary/80 truncate block max-w-[200px]">
                            {repo.full_name}
                          </a>
                          <span className={`text-sm ${categoryInfo.color} flex-shrink-0`}>{categoryInfo.icon}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">{repo.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm flex-shrink-0">
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold text-green-600 text-xs">{formatGrowthRate(repo.growthRate)}</div>
                        <div className="text-muted-foreground text-xs">growth</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold flex items-center justify-center gap-1 text-xs"><Star className="w-3 h-3 text-yellow-500" />{repo.stargazers_count.toLocaleString()}</div>
                        <div className="text-muted-foreground text-xs">stars</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold flex items-center justify-center gap-1 text-xs">{repo.trendIcon} {repo.healthScore}<span className="text-xs text-muted-foreground">%</span></div>
                        <div className="text-muted-foreground text-xs">health</div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Card key={repo.id} className="hover:shadow-lg transition-all duration-200 group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-lg font-bold text-muted-foreground flex-shrink-0">#{index + 1}</span>
                        <Avatar className="size-7 flex-shrink-0">
                          <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
                          <AvatarFallback className="text-xs">
                            {repo.owner.login.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`text-lg ${categoryInfo.color} flex-shrink-0`}>{categoryInfo.icon}</span>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className="text-lg">{repo.momentumIcon}</span>
                        <span className="text-lg">{repo.trendIcon}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <a href={repo.html_url} target="_blank" className="font-semibold text-primary hover:text-primary/80 group-hover:underline text-sm block truncate">
                        {repo.full_name}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                        {repo.description || 'No description available'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* Growth Rate - Prominently displayed */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Growth Rate:</span>
                        <Badge variant={repo.growthRate > 100 ? 'default' : 'secondary'} className="text-xs">
                          {formatGrowthRate(repo.growthRate)}
                        </Badge>
                      </div>

                      {/* Traditional metrics */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground"><Star className="w-3 h-3 text-yellow-500" /><span className="truncate">{repo.stargazers_count.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Package className="w-3 h-3 text-muted-foreground" /><span className="truncate">{repo.forks_count.toLocaleString()}</span></span>
                        {repo.language && (
                          <Badge variant="outline" className="text-xs px-1 py-0 max-w-[60px] truncate">
                            {repo.language}
                          </Badge>
                        )}
                      </div>

                      {/* Health Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Health:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${repo.healthScore > 85 ? 'bg-green-500' :
                                repo.healthScore > 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${repo.healthScore}%` }}
                            ></div>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium">{repo.trendIcon} {repo.healthScore}<span className="text-xs text-muted-foreground">%</span></span>
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
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"><BarChart className="w-4 h-4 inline mr-1" /> Category Breakdown</h4>
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
                    <div className="text-xs text-muted-foreground">{count} repos</div>
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