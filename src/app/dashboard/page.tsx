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

import { Search, TrendingUp, Users, GitFork, Star, Activity, Calendar, Clock, BarChart3, Eye, Code, Package, Award } from "lucide-react"
import { SearchModal } from '@/components/search/SearchModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'


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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Repositories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.totalRepos.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                {dashboardData.stats.trendingCount} trending
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Stars</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.totalStars.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Activity className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active growth
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Forks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.totalForks.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <GitFork className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Users className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Community driven
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Repos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.activeRepos.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Eye className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                {dashboardData.stats.healthyReposPercentage}% healthy
              </span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Repositories */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending Repositories</h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{period}</span>
            </div>

            <div className="space-y-3">
              {dashboardData.trendingRepos.slice(0, 5).map((repo, index) => (
                <div key={repo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{repo.full_name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{repo.language || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Languages */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Code className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Languages</h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{period}</span>
            </div>

            <div className="space-y-3">
              {dashboardData.topLanguages.slice(0, 5).map((language, index) => (
                <div key={language.language} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{language.language}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {language.repos_count.toLocaleString()} repos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {language.stars_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {language.percentage_of_total.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Contributors</h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{period}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.topContributors.slice(0, 6).map((contributor, index) => (
              <div key={contributor.login} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">#{index + 1}</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{contributor.login}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {contributor.stars_earned.toLocaleString()} stars
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
          </div>

          <div className="space-y-3">
            {dashboardData.recentEvents.slice(0, 5).map((event, index) => (
              <div key={`${event.type}-${event.created_at}-${index}`} className="flex items-start space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex-shrink-0">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.type.replace('Event', '')} activity
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {event.repo.name} • {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {dashboardData.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-400">{dashboardData.error}</p>
          </div>
        )}


      </div>

      {/* Search Modal - no props needed */}
      <SearchModal />
    </Layout>
  )
}