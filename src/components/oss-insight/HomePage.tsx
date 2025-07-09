'use client'

import { useState, useEffect } from 'react'
import { SearchHeader } from './SearchHeader'
import { TrendingRepos } from './TrendingRepos'
import { TopLanguages } from './TopLanguages'

import { CallToActionSection } from './CallToActionSection'
import { usePreferencesStore, useDataCacheStore, useStoreHydration } from '@/stores/appStore'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import type { TrendingRepo, TopLanguage } from '@/types/oss-insight'

export default function HomePage() {
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([])
  const [topLanguages, setTopLanguages] = useState<TopLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasHydrated = useStoreHydration()
  const { defaultPeriod, setDefaultPeriod } = usePreferencesStore()
  const { getCachedData, setCachedData } = useDataCacheStore()
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>(defaultPeriod)

  useEffect(() => {
    if (!hasHydrated) return
    loadData()
  }, [period, hasHydrated])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Cache key based on period
      const cachedRepos = getCachedData(`trendingRepos_${period}`)
      const cachedLanguages = getCachedData('topLanguages')

      if (Array.isArray(cachedRepos) && Array.isArray(cachedLanguages)) {
        setTrendingRepos(cachedRepos as TrendingRepo[])
        setTopLanguages((cachedLanguages as TopLanguage[]).slice(0, 8))
        setLoading(false)
        return
      }

      const [trending, languages] = await Promise.all([
        ossInsightClient.getTrendingRepos(period, 12),
        ossInsightClient.getTopLanguages('30d')
      ])

      const repoData = trending || []
      const langData = languages?.slice(0, 8) || []

      setTrendingRepos(repoData)
      setTopLanguages(langData)

      // Cache key based on period
      setCachedData(`trendingRepos_${period}`, repoData)
      setCachedData('topLanguages', languages || [])

    } catch (error) {
      console.error('Data loading failed:', error)
      setTrendingRepos([])
      setTopLanguages([])
      setError('An error occurred while loading data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod: '24h' | '7d' | '30d') => {
    setPeriod(newPeriod)
    setDefaultPeriod(newPeriod)
  }

  if (loading || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SearchHeader />
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover GitHub Trends
          </h2>
          <p className="text-xl text-gray-600">
            Trending projects and real-time programming language statistics
          </p>
        </div>
        <div className="space-y-12">
          <TrendingRepos
            repos={trendingRepos}
            period={period}
            setPeriod={handlePeriodChange}
          />

          <TopLanguages languages={topLanguages} />


          <CallToActionSection />
        </div>
      </main>
    </div>
  )
}