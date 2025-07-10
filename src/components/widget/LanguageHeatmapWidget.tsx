'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TopLanguage } from '@/types/oss-insight'

interface LanguageHeatmapWidgetProps {
  languages: TopLanguage[]
  period: '24h' | '7d' | '30d'
}

interface EnhancedLanguage extends TopLanguage {
  activityScore: number
  momentumIcon: string
  categoryColor: string
  categoryLabel: string
  growthIcon: string
}

const LANGUAGE_CATEGORIES = {
  'JavaScript': { category: 'Web Frontend', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'TypeScript': { category: 'Web Frontend', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Python': { category: 'Data Science', color: 'bg-green-100 text-green-800 border-green-200' },
  'Java': { category: 'Enterprise', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Go': { category: 'System/DevOps', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  'Rust': { category: 'System', color: 'bg-red-100 text-red-800 border-red-200' },
  'C++': { category: 'System', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'C#': { category: 'Enterprise', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  'PHP': { category: 'Web Backend', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  'Ruby': { category: 'Web Backend', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  'Swift': { category: 'Mobile', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Kotlin': { category: 'Mobile', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'Dart': { category: 'Mobile', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Shell': { category: 'DevOps', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  'R': { category: 'Data Science', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Julia': { category: 'Data Science', color: 'bg-purple-100 text-purple-800 border-purple-200' }
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
      let momentumIcon = '\u27a1\ufe0f'
      if (lang.trend === 'rising' && lang.rank_change > 0) momentumIcon = '\ud83d\ude80'
      else if (lang.trend === 'rising') momentumIcon = '\ud83d\udcc8'
      else if (lang.trend === 'declining') momentumIcon = '\ud83d\udcc9'

      // Growth icon based on rank change
      let growthIcon = '\u2192'
      if (lang.rank_change > 2) growthIcon = '\u2b06\u2b06'
      else if (lang.rank_change > 0) growthIcon = '\u2b06'
      else if (lang.rank_change < -2) growthIcon = '\u2b07\u2b07'
      else if (lang.rank_change < 0) growthIcon = '\u2b07'

      const categoryInfo = LANGUAGE_CATEGORIES[lang.language as keyof typeof LANGUAGE_CATEGORIES] ||
        { category: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' }

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
    if (intensity > 0.8) return 'bg-red-500'
    if (intensity > 0.6) return 'bg-orange-400'
    if (intensity > 0.4) return 'bg-yellow-400'
    if (intensity > 0.2) return 'bg-green-400'
    return 'bg-blue-400'
  }

  const getTrendColor = (trend: string, rankChange: number) => {
    if (trend === 'rising') return 'text-green-600'
    if (trend === 'declining') return 'text-red-600'
    return 'text-gray-600'
  }

  const maxActivityScore = Math.max(...enhancedLanguages.map(l => l.activityScore))
  const maxRepos = Math.max(...enhancedLanguages.map(l => l.repos_count))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            💻 Programming Languages
            <Badge variant="outline">{enhancedLanguages.length} languages</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'heatmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('heatmap')}
            >
              🔥 Heatmap
            </Button>
            <Button
              variant={viewMode === 'trend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trend')}
            >
              📈 Trends
            </Button>
            <Button
              variant={viewMode === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('activity')}
            >
              ⚡ Activity
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'heatmap' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ❌ Düz tablo → ✅ İnteraktif heatmap (intensity based on repository count)
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
                      ${isSelected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:ring-1 hover:ring-gray-300'}
                      opacity-90 hover:opacity-100
                    `}
                    onClick={() => setSelectedLanguage(isSelected ? null : lang.language)}
                  >
                    <div className="text-white text-center">
                      <div className="text-lg font-bold mb-1">{lang.momentumIcon}</div>
                      <div className="text-xs font-medium truncate">{lang.language}</div>
                      <div className="text-xs opacity-90">#{lang.rank}</div>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {lang.repos_count.toLocaleString()} repos • {lang.trend}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Color Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>Low Activity</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Medium</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>High Activity</span>
              </span>
            </div>
          </div>
        )}

        {viewMode === 'trend' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ❌ Statik liste → ✅ Trend analizi (📈 Rising, 📉 Declining)
            </p>

            {sortedLanguages.slice(0, 12).map((lang, index) => (
              <div key={lang.language} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.momentumIcon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{lang.language}</span>
                      <Badge className={lang.categoryColor} variant="outline">
                        {lang.categoryLabel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Rank #{lang.rank} • {lang.repos_count.toLocaleString()} repos
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold ${getTrendColor(lang.trend, lang.rank_change)}`}>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ❌ Sadece repo sayısı → ✅ Aktivite skorları (repos + stars + developers + trend)
            </p>

            {sortedLanguages.slice(0, 12).map((lang, index) => (
              <div key={lang.language} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold">{lang.language}</span>
                      <Badge className={lang.categoryColor} variant="outline">
                        {lang.categoryLabel}
                      </Badge>
                      <span className="text-lg">{lang.momentumIcon}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📦 {lang.repos_count.toLocaleString()}</span>
                      <span>⭐ {(lang.stars_count / 1000).toFixed(0)}K</span>
                      <span>👥 {(lang.developers_count / 1000).toFixed(0)}K devs</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600 mb-1">
                    {lang.activityScore}
                  </div>
                  <div className="text-xs text-gray-500">Activity Score</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
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
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg border">
            {(() => {
              const lang = enhancedLanguages.find(l => l.language === selectedLanguage)
              if (!lang) return null

              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold flex items-center space-x-2">
                      <span>{lang.language}</span>
                      <span>{lang.momentumIcon}</span>
                    </h4>
                    <Button size="sm" variant="outline" onClick={() => setSelectedLanguage(null)}>
                      ✕
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Rank</div>
                      <div className="font-bold">#{lang.rank}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Repositories</div>
                      <div className="font-bold">{lang.repos_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Total Stars</div>
                      <div className="font-bold">{(lang.stars_count / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Developers</div>
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
                    <span className="text-sm text-gray-600">
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