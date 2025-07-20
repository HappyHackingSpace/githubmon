// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useDataCacheStore, useSearchStore } from '@/stores'
import { useRequireAuth } from '@/hooks/useAuth'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage, GitHubEvent, TopContributor } from '@/types/oss-insight'

import { Search } from "lucide-react"
import { SearchModal } from '@/components/search/SearchModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import Footer from '@/components/layout/Footer'

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
  const { isAuthenticated, isLoading, orgData, shouldRender } = useRequireAuth()
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
    if (isAuthenticated && orgData) {
      loadDashboardData()
    }
  }, [isAuthenticated, orgData, period])

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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const userName = orgData?.orgName || 'Developer'
    return `${timeOfDay}, ${userName}! `
  }

  // Auth kontrolü - render yapma eğer yönlendirme gerekiyorsa
  if (!shouldRender) {
    return null // Hiçbir şey render etme, sadece yönlendir
  }

  if (isLoading || dashboardData.loading) {
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
            <ThemeToggle />
          </div>
        </div>


      </div>

      {/* Search Modal - no props needed */}
      <SearchModal />
      <Footer />
    </Layout>
  )
}