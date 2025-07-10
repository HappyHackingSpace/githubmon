'use client'

import { useState, useEffect } from 'react'
import { SearchHeader } from './SearchHeader'
import { TrendingRepos } from './TrendingRepos'
import { TopLanguages } from './TopLanguages'
import { CallToActionSection } from './CallToActionSection'
import { HomePageLoading, TrendingReposLoading, TopLanguagesLoading } from '@/components/common/LoadingBoundary'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage } from '@/types/oss-insight'
import { useStoreHydration, usePreferencesStore, useDataCacheStore } from '@/stores'

export default function HomePage() {
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([])
  const [topLanguages, setTopLanguages] = useState<TopLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)
  const [languagesLoading, setLanguagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    try {
      const cachedRepos = getCachedData(`trendingRepos_${period}`)

      if (Array.isArray(cachedRepos)) {
        setTrendingRepos(cachedRepos as TrendingRepo[])
      } else {
        const trending = await ossInsightClient.getTrendingRepos(period, 12)
        const repoData = trending || []
        setTrendingRepos(repoData)
        setCachedData(`trendingRepos_${period}`, repoData)
      }
    } catch (error) {
      console.error('Repos loading failed:', error)
      setTrendingRepos([])
    } finally {
      setReposLoading(false)
    }
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
          <p className="text-xl text-muted-foreground">
            Trending projects and real-time programming language statistics
          </p>
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