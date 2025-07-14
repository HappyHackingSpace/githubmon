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
import { useAuthStore, useDataCacheStore, useStoreHydration, useSearchStore } from '@/stores'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage, GitHubEvent, TopContributor } from '@/types/oss-insight'
import { TrendingReposWidget } from '@/components/widget/TrendingReposWidget'
import { LanguageHeatmapWidget } from '@/components/widget/LanguageHeatmapWidget'
import { ActivityFeedWidget } from '@/components/widget/ActivityFeedWidget'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { Folder, AlertTriangle, Search } from "lucide-react"
import { SearchModal } from '@/components/search/SearchModal'
import { CallToActionSection } from '@/components/CallToActionSection'

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
  const { setSearchModalOpen } = useSearchStore()

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
      let cachedData = null;

      try {

        if (cacheKey && typeof getCachedData === 'function') {
          cachedData = getCachedData(cacheKey as any)
          // Ensure the returned data is valid
          if (cachedData && typeof cachedData !== 'object') {
            console.warn('Invalid cache data format, ignoring cache')
            cachedData = null
          }
        } else {
          console.warn('Cache key or getCachedData function is invalid')
        }
      } catch (cacheError) {
        console.warn('Cache retrieval failed:', cacheError)
        // Continue without using cache
      }

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
      setCachedData(cacheKey as any, newData, 10 * 60 * 1000)

    } catch (error) {
      console.error('Dashboard data loading failed:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data. Please try again.'
      }))
    }
  }

 

  return (
 
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             GithubMon 
            </h1>
           
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSearchModalOpen(true)}
              className="px-6 py-2.5 font-medium text-base"
              size="lg"
            >
              <Search className="w-6 h-6 mr-2" />
              Search
            </Button>

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
          </div>
        </div>
        
          <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Discover GitHub Trends
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Trending projects and real-time programming language statistics
          </p>
        </div>

        {/* Quick Stats Cards */}
        <StatsOverview stats={dashboardData.stats} loading={dashboardData.loading} />

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

          </div>
        </div>
      </div>
      

      <CallToActionSection />

      {/* Search Modal - no props needed */}
      <SearchModal />
    </>
  )
}