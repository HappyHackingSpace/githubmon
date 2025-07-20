'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore, useDataCacheStore, useStoreHydration, useSearchStore } from '@/stores'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage, GitHubEvent, TopContributor } from '@/types/oss-insight'
import { TrendingReposWidget } from '@/components/widget/TrendingReposWidget'
import { LanguageHeatmapWidget } from '@/components/widget/LanguageHeatmapWidget'
import { ActivityFeedWidget } from '@/components/widget/ActivityFeedWidget'
import { StatsOverview } from '@/components/widget/StatsOverview'
import { AlertTriangle, Search } from "lucide-react"
import { SearchModal } from '@/components/search/SearchModal'
import { CallToActionSection } from '@/components/CallToActionSection'
import { Header } from '@/components/layout/Header'
import { useState } from 'react'

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

export default function HomePage() {
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

  // Sadece giriş yapmış kullanıcılar dashboard butonunu görür
  // Otomatik yönlendirme yapmıyoruz, kullanıcı kendisi karar verir

  // Ana sayfa verilerini yükle (tüm kullanıcılar için - giriş yapmış veya yapmamış)
  useEffect(() => {
    if (hasHydrated) {
      loadPublicData()
    }
  }, [hasHydrated, period])

  const loadPublicData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const cacheKey = `public_data_${period}`
      let cachedData = null

      try {
        if (cacheKey && typeof getCachedData === 'function') {
          cachedData = getCachedData(cacheKey as any)
          if (cachedData && typeof cachedData !== 'object') {
            console.warn('Invalid cache data format, ignoring cache')
            cachedData = null
          }
        }
      } catch (cacheError) {
        console.warn('Cache retrieval failed:', cacheError)
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
      console.error('Public data loading failed:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load data. Please try again.'
      }))
    }
  }

  // Yükleme durumu
  if (!hasHydrated || dashboardData.loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Discover GitHub Trends
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Explore trending projects and real-time programming language statistics
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
                <Button size="sm" variant="outline" onClick={loadPublicData}>
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
              {cat === 'all' ? 'All' :
                cat === 'ai-ml' ? 'AI/ML' :
                  cat === 'web-dev' ? 'Web Dev' :
                    cat === 'devops' ? 'DevOps' : 'Mobile'}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Repositories */}
            <TrendingReposWidget
              repos={dashboardData.trendingRepos}
              period={period}
              category={selectedCategory}
              setPeriod={setPeriod}
            />

            {/* Language Heatmap */}
            <LanguageHeatmapWidget
              languages={dashboardData.topLanguages}
              period={period}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <ActivityFeedWidget
              events={dashboardData.recentEvents}
              maxItems={10}
            />
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <CallToActionSection />

      {/* Search Modal */}
      <SearchModal />
    </>
  )
}