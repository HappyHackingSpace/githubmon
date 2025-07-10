'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Code2, TrendingUp, TrendingDown, Activity, Star, Users, Package, ArrowUpRight, ArrowDownRight, Minus, Flame, BarChart, Zap } from 'lucide-react'
import type { TopLanguage } from '@/types/oss-insight'

interface LanguageHeatmapWidgetProps {
  languages: TopLanguage[]
  period: '24h' | '7d' | '30d'
}

interface EnhancedLanguage extends TopLanguage {
  activityScore: number
  momentumIcon: React.ReactNode
  categoryColor: string
  categoryLabel: string
  growthIcon: React.ReactNode
}

const LANGUAGE_CATEGORIES = {
  'JavaScript': { category: 'Web Frontend', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'TypeScript': { category: 'Web Frontend', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Python': { category: 'Data Science', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Java': { category: 'Enterprise', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Go': { category: 'System/DevOps', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Rust': { category: 'System', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'C++': { category: 'System', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'C#': { category: 'Enterprise', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'PHP': { category: 'Web Backend', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Ruby': { category: 'Web Backend', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Swift': { category: 'Mobile', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Kotlin': { category: 'Mobile', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Dart': { category: 'Mobile', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Shell': { category: 'DevOps', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'R': { category: 'Data Science', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' },
  'Julia': { category: 'Data Science', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' }
}

export function LanguageHeatmapWidget({ languages, period }: LanguageHeatmapWidgetProps) {
  const [viewMode, setViewMode] = useState<'heatmap' | 'trend' | 'activity'>('heatmap')
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  // Calculate activity scores (based on commits/issues/PRs)
  const enhancedLanguages = useMemo((): EnhancedLanguage[] => {
    const maxRepos = Math.max(...languages.map(l => l.repos_count))
    const maxStars = Math.max(...languages.map(l => l.stars_count))

    return languages.map((lang, index) => {
      // Calculate activity score based on multiple factors
      const repoNormalized = (lang.repos_count / maxRepos) * 40
      const starsNormalized = (lang.stars_count / maxStars) * 30
      const developersNormalized = (lang.developers_count / 100000) * 20
      const trendBonus = lang.trend === 'rising' ? 10 : lang.trend === 'declining' ? -5 : 0

      const activityScore = Math.min(100, Math.round(
        repoNormalized + starsNormalized + developersNormalized + trendBonus
      ))

      // Momentum icon based on trend and rank change
      let momentumIcon = <Minus className="w-4 h-4 text-muted-foreground" />
      if (lang.trend === 'rising' && lang.rank_change > 0) momentumIcon = <Flame className="w-4 h-4 text-orange-500" />
      else if (lang.trend === 'rising') momentumIcon = <TrendingUp className="w-4 h-4 text-green-500" />
      else if (lang.trend === 'declining') momentumIcon = <TrendingDown className="w-4 h-4 text-red-500" />

      // Growth icon based on rank change
      let growthIcon = <Minus className="w-4 h-4 text-muted-foreground" />
      if (lang.rank_change > 2) growthIcon = <ArrowUpRight className="w-4 h-4 text-green-600" />
      else if (lang.rank_change > 0) growthIcon = <TrendingUp className="w-4 h-4 text-green-500" />
      else if (lang.rank_change < -2) growthIcon = <ArrowDownRight className="w-4 h-4 text-red-600" />
      else if (lang.rank_change < 0) growthIcon = <TrendingDown className="w-4 h-4 text-red-500" />

      const categoryInfo = LANGUAGE_CATEGORIES[lang.language as keyof typeof LANGUAGE_CATEGORIES] ||
        { category: 'Other', color: 'bg-blue-100 text-white border-blue-200 dark:bg-blue-900/30 dark:text-white dark:border-blue-700' }

      return {
        ...lang,
        activityScore,
        momentumIcon,
        categoryColor: categoryInfo.color,
        categoryLabel: categoryInfo.category,
        growthIcon
      }
    })
  }, [languages])

  const sortedLanguages = useMemo(() => {
    return [...enhancedLanguages].sort((a, b) => {
      switch (viewMode) {
        case 'activity': return b.activityScore - a.activityScore
        case 'trend': return (b.rank_change || 0) - (a.rank_change || 0)
        default: return a.rank - b.rank
      }
    })
  }, [enhancedLanguages, viewMode])

  const getHeatmapIntensity = (value: number, maxValue: number) => {
    const intensity = (value / maxValue)
    if (intensity > 0.8) return 'bg-blue-500/30 border-blue-500/40 text-white dark:text-white'
    if (intensity > 0.6) return 'bg-blue-400/25 border-blue-400/35 text-white dark:text-white'
    if (intensity > 0.4) return 'bg-blue-400/20 border-blue-400/30 text-white dark:text-white'
    if (intensity > 0.2) return 'bg-blue-400/15 border-blue-400/25 text-white dark:text-white'
    return 'bg-blue-400/10 border-blue-400/20 text-white dark:text-white'
  }

  const getTrendColor = (trend: string, rankChange: number) => {
    if (trend === 'rising') return 'text-green-600'
    if (trend === 'declining') return 'text-red-600'
    return 'text-muted-foreground'
  }

  const maxActivityScore = Math.max(...enhancedLanguages.map(l => l.activityScore))
  const maxRepos = Math.max(...enhancedLanguages.map(l => l.repos_count))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" /> Programming Languages
            <Badge variant="outline">{enhancedLanguages.length} languages</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'heatmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('heatmap')}
            >
              <Flame className="w-4 h-4" /> Heatmap
            </Button>
            <Button
              variant={viewMode === 'trend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trend')}
            >
              <TrendingUp className="w-4 h-4" /> Trends
            </Button>
            <Button
              variant={viewMode === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('activity')}
            >
              <Activity className="w-4 h-4" /> Activity
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'heatmap' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Interactive heatmap showing language activity intensity based on repository count
            </p>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {sortedLanguages.slice(0, 24).map((lang) => {
                const intensity = lang.repos_count / maxRepos
                const isSelected = selectedLanguage === lang.language

                return (
                  <div
                    key={lang.language}
                    className={`
                      relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105
                      ${getHeatmapIntensity(lang.repos_count, maxRepos)} 
                      ${isSelected ? 'ring-2 ring-primary scale-105' : 'hover:ring-1 hover:ring-muted-foreground'}
                      opacity-90 hover:opacity-100 hover:shadow-md
                    `}
                    onClick={() => setSelectedLanguage(isSelected ? null : lang.language)}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-1">{lang.momentumIcon}</div>
                      <div className="text-xs font-medium truncate font-semibold">{lang.language}</div>
                      <div className="text-xs opacity-75 font-medium">#{lang.rank}</div>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {lang.repos_count.toLocaleString()} repos • {lang.trend}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Color Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400/20 border border-blue-400/30 rounded"></div>
                <span>Low Activity</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-400/20 border border-yellow-400/30 rounded"></div>
                <span>Medium</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
                <span>High Activity</span>
              </span>
            </div>
          </div>
        )}

        {viewMode === 'trend' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Language trends showing rising and declining popularity with rank changes
            </p>

            {sortedLanguages.slice(0, 12).map((lang, index) => (
              <div key={lang.language} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{lang.momentumIcon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white dark:text-white">{lang.language}</span>
                      <Badge className={lang.categoryColor} variant="outline">
                        {lang.categoryLabel}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rank #{lang.rank} • {lang.repos_count.toLocaleString()} repos
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold flex items-center gap-1 ${getTrendColor(lang.trend, lang.rank_change)}`}>
                    {lang.growthIcon}
                    {lang.rank_change > 0 ? `+${lang.rank_change}` : lang.rank_change || '0'}
                  </div>
                  <div className="text-sm capitalize">
                    <Badge variant={lang.trend === 'rising' ? 'default' : lang.trend === 'declining' ? 'destructive' : 'secondary'}>
                      {lang.trend}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'activity' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Comprehensive activity scores combining repositories, stars, developers, and trends
            </p>

            {sortedLanguages.slice(0, 12).map((lang, index) => (
              <div key={lang.language} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white dark:text-white">{lang.language}</span>
                      <Badge className={lang.categoryColor} variant="outline">
                        {lang.categoryLabel}
                      </Badge>
                      <span className="text-lg">{lang.momentumIcon}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="w-4 h-4" />{lang.repos_count.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />{(lang.stars_count / 1000).toFixed(0)}K</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(lang.developers_count / 1000).toFixed(0)}K devs</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-primary mb-1">
                    {lang.activityScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Activity Score</div>
                  <div className="w-20 bg-muted rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${lang.activityScore > 80 ? 'bg-green-500' :
                        lang.activityScore > 60 ? 'bg-yellow-500' :
                          lang.activityScore > 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${lang.activityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Language Details */}
        {selectedLanguage && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            {(() => {
              const lang = enhancedLanguages.find(l => l.language === selectedLanguage)
              if (!lang) return null

              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white dark:text-white flex items-center space-x-2">
                      <span>{lang.language}</span>
                      <span>{lang.momentumIcon}</span>
                    </h4>
                    <Button size="sm" variant="outline" onClick={() => setSelectedLanguage(null)}>
                      ✕
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Rank</div>
                      <div className="font-bold">#{lang.rank}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Repositories</div>
                      <div className="font-bold">{lang.repos_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Stars</div>
                      <div className="font-bold">{(lang.stars_count / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Developers</div>
                      <div className="font-bold">{(lang.developers_count / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4">
                    <Badge className={lang.categoryColor}>
                      {lang.categoryLabel}
                    </Badge>
                    <Badge variant={lang.trend === 'rising' ? 'default' : lang.trend === 'declining' ? 'destructive' : 'secondary'}>
                      {lang.trend}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Activity Score: <span className="font-bold">{lang.activityScore}/100</span>
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}