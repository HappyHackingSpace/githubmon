'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RateLimitWarning } from '@/components/common/RateLimitWarning'
import { ossInsightClient, formatTrendingData, formatLanguageData } from '@/lib/api/oss-insight-client'
import { useRouter } from 'next/navigation'

import type { TrendingRepo, TopLanguage } from '@/types/oss-insight'
export default function HomePage() {
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([])
  const [topLanguages, setTopLanguages] = useState<TopLanguage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'repos' | 'users' | 'orgs'>('repos')
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h')
  
  const router = useRouter()

  useEffect(() => {
    loadOSSInsightData()
  }, [period])

  const loadOSSInsightData = async () => {
    setLoading(true)
    try {
      const [trending, languages] = await Promise.all([
        ossInsightClient.getTrendingRepos(period, 12),
        ossInsightClient.getTopLanguages('30d')
      ])
      
      setTrendingRepos(trending || [])
      setTopLanguages(languages?.slice(0, 8) || [])
    } catch (error) {
      console.error('OSS Insight verileri yüklenemedi:', error)
      // Fallback data
      setTrendingRepos([])
      setTopLanguages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      if (searchType === 'repos') {
        const results = await ossInsightClient.searchRepositories(searchQuery)
        // Sonuçları göstermek için yeni sayfa veya modal
        console.log('Repo arama sonuçları:', results)
      } else {
        const results = await ossInsightClient.searchUsers(searchQuery, searchType === 'users' ? 'users' : 'orgs')
        console.log('Kullanıcı arama sonuçları:', results)
      }
    } catch (error) {
      console.error('Arama hatası:', error)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Search */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">GitHubMon</h1>
              <Badge variant="secondary">OSS Analytics</Badge>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md mx-8">
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repos">Repolar</SelectItem>
                  <SelectItem value="users">Kullanıcılar</SelectItem>
                  <SelectItem value="orgs">Organizasyonlar</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="text"
                placeholder={`${searchType === 'repos' ? 'Repository' : searchType === 'users' ? 'Kullanıcı' : 'Organizasyon'} ara...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </form>
            
            {/* Rate Limit Warning */}
            <div className="flex items-center space-x-3">
              <RateLimitWarning />
              <button 
                onClick={() => router.push('/login')}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
             GitHub Trendlerini Keşfedin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trending projeler, en aktif geliştiriciler ve programlama dillerinin anlık istatistiklerini takip edin.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Trending Repositories */}
            <section>
              <div className="flex justify-between items-center mb-6">
<h3 className="text-2xl font-bold text-gray-900"> Trending Repositories</h3>
                <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Son 24 Saat</SelectItem>
                    <SelectItem value="7d">Son 7 Gün</SelectItem>
                    <SelectItem value="30d">Son 30 Gün</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingRepos.map((repo, index) => (
                  <Card key={repo.full_name} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <img 
                            src={repo.owner.avatar_url} 
                            alt={repo.owner.login}
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                        {repo.stars_increment && repo.stars_increment > 0 && (
                          <Badge variant="default">+{repo.stars_increment} ⭐</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        <a 
                          href={repo.html_url} 
                          target="_blank" 
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {repo.full_name}
                        </a>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {repo.description || 'Açıklama bulunmuyor'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm">⭐ {repo.stargazers_count.toLocaleString()}</span>
                          {repo.language && (
                            <Badge variant="outline">{repo.language}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Top Programming Languages */}
            <section>
<h3 className="text-2xl font-bold text-gray-900 mb-6">→ Top Programming Languages</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topLanguages.map((lang, index) => (
                  <Card key={lang.language} className="text-center">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-lg">{getTrendIcon(lang.trend)}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{lang.language}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{lang.repos_count.toLocaleString()} repos</div>
                        <div>⭐ {lang.stars_count.toLocaleString()}</div>
                      </div>
                      <Badge 
                        variant={lang.trend === 'rising' ? 'default' : lang.trend === 'declining' ? 'destructive' : 'secondary'}
                        className="mt-2"
                      >
                        {lang.trend === 'rising' ? 'Yükseliyor' : lang.trend === 'declining' ? 'Düşüyor' : 'Stabil'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Stats */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 Platform İstatistikleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">2.1M+</div>
                    <div className="text-gray-600">Aktif Repository</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">89K+</div>
                    <div className="text-gray-600">Geliştiriciler</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">450M+</div>
                    <div className="text-gray-600">Toplam Stars</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">12K+</div>
                    <div className="text-gray-600">Günlük Commit</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center py-12">
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Daha Fazla Analiz İstiyorsanız</h3>
                  <p className="text-lg mb-6">
                    GitHub token'ınızla giriş yapın ve organizasyonunuzu detaylı analiz edin
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    GitHub ile Giriş Yap
                  </button>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}