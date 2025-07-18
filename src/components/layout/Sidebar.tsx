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
import { Home, Flame, TrendingUp, Languages, Users, FolderOpen, BarChart2 } from 'lucide-react'

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
   
    { href: '/dashboard', label: ' Dashboard', icon: Flame }
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
              const Icon = item.icon
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
                  <Icon size={18} className="text-foreground" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Theme Toggle - Fixed at bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <ThemeToggleMinimal />
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