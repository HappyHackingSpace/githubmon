'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggleMinimal } from '@/components/theme/ThemeToggle'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import { useSidebarState } from '@/stores'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface TrendingItem {
  name: string
  description: string
  stars: number
  language: string
  url: string
  type: 'repo' | 'user' | 'topic'
}

export function Sidebar() {
  const pathname = usePathname()
  const [quickTrends, setQuickTrends] = useState<TrendingItem[]>([])
  const [topTopics, setTopTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { isOpen, setOpen } = useSidebarState()

  useEffect(() => {
    loadSidebarData()
  }, [])

  const loadSidebarData = async () => {
    try {
      const [trending, collections] = await Promise.all([
        ossInsightClient.getTrendingRepos('24h', 8),
        ossInsightClient.getHotCollections(6)
      ])
      
      setQuickTrends(trending.map(repo => ({
        name: repo.name,
        description: repo.description || '',
        stars: repo.stargazers_count,
        language: repo.language || '',
        url: repo.html_url,
        type: 'repo' as const
      })))
      
      setTopTopics(collections.map(col => col.name))
    } catch (error) {
      console.error('Sidebar verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { href: '/', label: '🏠 Ana Sayfa', icon: '🏠' },
    { href: '/trending', label: '🔥 Trending', icon: '🔥' },
    { href: '/languages', label: '💻 Diller', icon: '💻' },
    { href: '/contributors', label: '👥 Geliştiriciler', icon: '👥' },
    { href: '/collections', label: '📚 Koleksiyonlar', icon: '📚' },
    { href: '/analytics', label: '📊 Analytics', icon: '📊' },
    { href: '/dashboard', label: '⚡ Dashboard', icon: '⚡' },
    { href: '/login', label: '🔐 Giriş Yap', icon: '🔐' }
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
       
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        flex flex-col
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">GitHubMon</h2>
            <p className="text-xs text-muted-foreground">OSS Analytics</p>
          </div>
          <button 
        
            className="lg:hidden text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
               
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                    ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-primary font-medium' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Quick Trends */}
          <div className="p-4 border-t border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">🚀 Hızlı Trendler</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {quickTrends.slice(0, 6).map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    className="block group"
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-card-foreground truncate group-hover:text-primary">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description.slice(0, 60)}...
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-muted-foreground">⭐ {item.stars}</span>
                            {item.language && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {item.language}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Hot Topics */}
          <div className="p-4 border-t border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">🔥 Popüler Konular</h3>
            <div className="flex flex-wrap gap-2">
              {topTopics.map((topic, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-sidebar-accent transition-colors"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* GitHub Stats Widget */}
          <div className="p-4 border-t border-sidebar-border">
            <Card className="bg-gradient-to-br from-muted/50 to-muted">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-card-foreground mb-3">📈 Anlık GitHub</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aktif Repos:</span>
                    <span className="font-medium text-card-foreground">2.1M+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Günlük Commits:</span>
                    <span className="font-medium text-card-foreground">12K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yeni PRs:</span>
                    <span className="font-medium text-card-foreground">3.2K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aktif Devs:</span>
                    <span className="font-medium text-card-foreground">89K+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="p-4 border-t border-sidebar-border">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <h3 className="text-sm font-semibold mb-2">🚀 Pro Analytics</h3>
                <p className="text-xs mb-3 opacity-90">
                  Organizasyonunuzu detaylı analiz edin
                </p>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.location.href = '/login'}
                >
                  Token ile Giriş
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-sidebar-border">
            <ThemeToggleMinimal />
          </div>
        </div>
      </aside>
    </>
  )
}


export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 bg-background p-2 rounded-lg shadow-lg border border-border hover:bg-accent transition-colors"
    >
      <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}