// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuthStore, useDataCacheStore, useStoreHydration } from '@/stores'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage, GitHubEvent, TopContributor } from '@/types/oss-insight'
import { TrendingReposWidget } from '@/components/widget/TrendingReposWidget'
import { LanguageHeatmapWidget } from '@/components/widget/LanguageHeatmapWidget'
import { ActivityFeedWidget } from '@/components/widget/ActivityFeedWidget'
import { Star, Folder, GitFork, HeartPulse, AlertTriangle } from "lucide-react"

interface DashboardStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  activeRepos: number
  trendingCount: number
  healthyReposPercentage: number
}

interface DashboardData {
  stats: DashboardStats
  trendingRepos: TrendingRepo[]
  topLanguages: TopLanguage[]
  recentEvents: GitHubEvent[]
  topContributors: TopContributor[]
  loading: boolean
  error: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const hasHydrated = useStoreHydration()
  const { isConnected, orgData, isTokenValid } = useAuthStore()
  const { getCachedData, setCachedData } = useDataCacheStore()

  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai-ml' | 'web-dev' | 'devops' | 'mobile'>('all')
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalRepos: 0,
      totalStars: 0,
      totalForks: 0,
      activeRepos: 0,
      trendingCount: 0,
      healthyReposPercentage: 0
    },
    trendingRepos: [],
    topLanguages: [],
    recentEvents: [],
    topContributors: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!hasHydrated) return

    if (!isConnected || !orgData) {
      router.push('/login')
      return
    }

    if (orgData.token && !isTokenValid()) {
      router.push('/login')
      return
    }
  }, [hasHydrated, isConnected, orgData, isTokenValid, router])

  useEffect(() => {
    if (!hasHydrated || !isConnected) return
    loadDashboardData()
  }, [hasHydrated, isConnected, period])

  const loadDashboardData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const cacheKey = `dashboard_${period}_${orgData?.orgName}`
      const cachedData = getCachedData(cacheKey)

      if (cachedData) {
        setDashboardData(prev => ({
          ...prev,
          ...cachedData as Partial<DashboardData>,
          loading: false
        }))
        return
      }

      const [repoStats, trending, languages, events, contributors] = await Promise.all([
        ossInsightClient.getRepositoryStats(),
        ossInsightClient.getTrendingRepos(period, 20),
        ossInsightClient.getTopLanguages(period === '24h' ? '7d' : period === '7d' ? '30d' : '90d'),
        ossInsightClient.getRecentEvents(30),
        ossInsightClient.getTopContributors(period === '24h' ? '7d' : period === '7d' ? '30d' : '90d', 15)
      ])

      const dashboardStats: DashboardStats = {
        totalRepos: repoStats.total_repos,
        totalStars: repoStats.total_stars,
        totalForks: repoStats.total_forks,
        activeRepos: repoStats.active_repos_count,
        trendingCount: trending.length,
        healthyReposPercentage: Math.round((repoStats.active_repos_count / repoStats.total_repos) * 100)
      }

      const newData = {
        stats: dashboardStats,
        trendingRepos: trending,
        topLanguages: languages,
        recentEvents: events,
        topContributors: contributors,
        loading: false,
        error: null
      }

      setDashboardData(newData)

      // Cache for 10 minutes
      const cacheKeyMap = {
        '24h': `trendingRepos_24h_${orgData?.orgName}`,
        '7d': `trendingRepos_7d_${orgData?.orgName}`,
        '30d': `trendingRepos_30d_${orgData?.orgName}`,
      } as const

    } catch (error) {
      console.error('Dashboard data loading failed:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data. Please try again.'
      }))
    }
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const userName = orgData?.orgName || 'Developer'
    return `${timeOfDay}, ${userName}! `
  }

  const getHealthScore = () => {
    const { stats } = dashboardData
    let score = 70 // Base score

    if (stats.healthyReposPercentage > 80) score += 20
    else if (stats.healthyReposPercentage > 60) score += 10

    if (stats.trendingCount > 5) score += 10

    return Math.min(100, score)
  }

  if (!hasHydrated || dashboardData.loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getWelcomeMessage()}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Your GitHub analytics dashboard • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(value: '24h' | '7d' | '30d') => setPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadDashboardData} disabled={dashboardData.loading}>
              {dashboardData.loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Repos</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {dashboardData.stats.totalRepos.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stars</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {(dashboardData.stats.totalStars / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GitFork className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Forks</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {dashboardData.stats.totalForks.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {dashboardData.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>{dashboardData.error}</span>
                <Button size="sm" variant="outline" onClick={loadDashboardData}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Focus:</span>
          {(['all', 'ai-ml', 'web-dev', 'devops', 'mobile'] as const).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? ' All' :
                cat === 'ai-ml' ? ' AI/ML' :
                  cat === 'web-dev' ? ' Web Dev' :
                    cat === 'devops' ? ' DevOps' : ' Mobile'}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">

            {/* Trending Repositories with Intelligence */}
            <TrendingReposWidget
              repos={dashboardData.trendingRepos}
              period={period}
              category={selectedCategory}
            />

            {/* Language Heatmap */}
            <LanguageHeatmapWidget
              languages={dashboardData.topLanguages}
              period={period}
            />

            {/* Repository Health & Momentum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <RepositoryHealthWidget repos={dashboardData.trendingRepos} />
              <MomentumAnalysisWidget repos={dashboardData.trendingRepos} period={period} /> */}
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">

            {/* Activity Feed - NOW ACTIVE */}
            <ActivityFeedWidget
              events={dashboardData.recentEvents}
              maxItems={10}
            />

            {/* Top Contributors */}
            {/* <ContributorInsightsWidget 
              contributors={dashboardData.topContributors}
              maxItems={8}
            /> */}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Button variant="outline" className="w-full flex justify-between items-center p-3">
                  View Full Analytics
                  <span>→</span>
                </Button>
                <Button variant="outline" className="w-full flex justify-between items-center p-3">
                  Advanced Search
                  <span>→</span>
                </Button>
                <Button variant="outline" className="w-full flex justify-between items-center p-3">
                  Export Report
                  <span>→</span>
                </Button>
                <Button variant="outline" className="w-full flex justify-between items-center p-3">
                  Settings
                  <span>→</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Insights */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Repos
                      </p>
                      <p className="text-xl font-semibold">
                        {dashboardData.stats.totalRepos.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Stars
                      </p>
                      <p className="text-xl font-semibold">
                        {(dashboardData.stats.totalStars / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Forks
                      </p>
                      <p className="text-xl font-semibold">
                        {dashboardData.stats.totalForks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Health Score
                      </p>
                      <p className="text-xl font-semibold">
                        {getHealthScore()}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}