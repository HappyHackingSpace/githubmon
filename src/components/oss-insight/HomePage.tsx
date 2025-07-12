'use client'

import { useState, useEffect } from 'react'
import { SearchHeader } from './SearchHeader'
import { TrendingRepos } from './TrendingRepos'
import { TopLanguages } from './TopLanguages'
import { CallToActionSection } from './CallToActionSection'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { HomePageLoading, TrendingReposLoading, TopLanguagesLoading } from '@/components/common/LoadingBoundary'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage } from '@/types/oss-insight'
import { useStoreHydration, usePreferencesStore, useDataCacheStore } from '@/stores'
export default function HomePage() {
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([])
  const [topLanguages, setTopLanguages] = useState<TopLanguage[]>([])
  const [platformStats, setPlatformStats] = useState({
    totalRepos: 2100000,
    totalStars: 450000000,
    totalForks: 89000000,
    activeRepos: 850000,
    trendingCount: 1250,
    healthyReposPercentage: 85
  })
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)
  const [languagesLoading, setLanguagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reposError, setReposError] = useState<string | null>(null)

  const hasHydrated = useStoreHydration()
  const { defaultPeriod, setDefaultPeriod } = usePreferencesStore()
  const { getCachedData, setCachedData } = useDataCacheStore()
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>(defaultPeriod)

  useEffect(() => {
    if (!hasHydrated) return
    loadInitialData()
  }, [hasHydrated])

  useEffect(() => {
    if (!hasHydrated) return
    loadRepos()
  }, [period, hasHydrated])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load platform stats
      const repoStats = await ossInsightClient.getRepositoryStats()
      setPlatformStats({
        totalRepos: repoStats.total_repos,
        totalStars: repoStats.total_stars,
        totalForks: repoStats.total_forks,
        activeRepos: repoStats.active_repos_count,
        trendingCount: repoStats.trending_repos_count,
        healthyReposPercentage: Math.round((repoStats.active_repos_count / repoStats.total_repos) * 100)
      })

      const cachedLanguages = getCachedData('topLanguages')

      if (Array.isArray(cachedLanguages)) {
        setTopLanguages((cachedLanguages as TopLanguage[]).slice(0, 8))
      } else {
        setLanguagesLoading(true)
        const languages = await ossInsightClient.getTopLanguages('30d')
        const langData = languages?.slice(0, 8) || []
        setTopLanguages(langData)
        setCachedData('topLanguages', languages || [])
        setLanguagesLoading(false)
      }

      await loadRepos()
    } catch (error) {
      console.error('Initial data loading failed:', error)
      setError('An error occurred while loading data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadRepos = async () => {
    setReposLoading(true)
    setReposError(null)
    try {
      console.log(`Loading trending repos for period: ${period}`)
      const cachedRepos = getCachedData(`trendingRepos_${period}`)

      if (Array.isArray(cachedRepos) && cachedRepos.length > 0) {
        console.log(`Using cached repos: ${cachedRepos.length} items`)
        setTrendingRepos(cachedRepos as TrendingRepo[])
      } else {
        console.log('Fetching fresh repo data from API')
        const trending = await ossInsightClient.getTrendingRepos(period, 12)
        const repoData = trending || []
        console.log(`Fetched ${repoData.length} repositories`)
        setTrendingRepos(repoData)
        if (repoData.length > 0) {
          setCachedData(`trendingRepos_${period}`, repoData)
        } else {
          setReposError('No repositories found for this period')
        }
      }
    } catch (error) {
      console.error('Repos loading failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trending repositories'
      setReposError(errorMessage)
      setTrendingRepos([])
    } finally {
      setReposLoading(false)
    }
  }

  const handleRefresh = () => {
    // Clear cache for current period and reload
    setCachedData(`trendingRepos_${period}`, null)
    loadRepos()
  }

  const handlePeriodChange = (newPeriod: '24h' | '7d' | '30d') => {
    setPeriod(newPeriod)
    setDefaultPeriod(newPeriod)
  }

  // Show full page loading on initial load
  if (loading || !hasHydrated) {
    return <HomePageLoading />
  }

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Discover GitHub Trends
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Trending projects and real-time programming language statistics
          </p>
        </div>

        {/* Platform Statistics */}
        <div className="mb-12">
          <StatsOverview stats={platformStats} loading={loading} />
        </div>

        <div className="space-y-12">
          {/* Trending Repos with loading state */}
          {reposLoading ? (
            <TrendingReposLoading />
          ) : (
            <TrendingRepos
              repos={trendingRepos}
              period={period}
              setPeriod={handlePeriodChange}
              loading={reposLoading}
              error={reposError}
            />
          )}

          {/* Top Languages with loading state */}
          {languagesLoading ? (
            <TopLanguagesLoading />
          ) : (
            <TopLanguages languages={topLanguages} />
          )}

          <CallToActionSection />
        </div>
      </main>
    </div>
  )
}