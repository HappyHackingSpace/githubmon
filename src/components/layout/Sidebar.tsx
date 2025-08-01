'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'


import { useSidebarState, useAuthStore, useStoreHydration, useActionItemsStore } from '@/stores'
import { ChevronRight, Clock, Flame, LogOut, MessageSquare, Sparkles, Star, Target, Zap, } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

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
  const searchParams = useSearchParams()
  const { isOpen, setOpen } = useSidebarState()

  // Auth state
  const hasHydrated = useStoreHydration()
  const { isConnected, orgData, logout } = useAuthStore()

  // Action items state
  const { getCountByType, getTotalCount, loading, refreshData } = useActionItemsStore()

  // Get current tab from URL params
  const currentTab = searchParams.get('tab') || 'assigned'
  const isDashboardPage = pathname.startsWith('/dashboard')

  // Badge count helpers
  const getBadgeCount = (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => getCountByType(type)
  const getTotalActionCount = () => getTotalCount()

  // Show loading state in badges
  const getBadgeContent = (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => {
    if (loading[type]) return '...'
    return getBadgeCount(type)
  }

  const router = useRouter()

  // Hangi bölümün açık olduğunu kontrol etmek için
  const isQuickWinsTab = currentTab === 'quick-wins' || currentTab === 'good-first-issues' || currentTab === 'easy-fixes'
  const isActionRequiredTab = !isQuickWinsTab && isDashboardPage

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Flame }
  ]

  const handleLogout = () => {
    logout() // logout fonksiyonu artık otomatik yönlendirme yapıyor
  }
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

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
            onClick={() => setOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            ✕
          </button>
        </div>


        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          {/* Navigation Menu with Collapsible */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {/* Action Required - Active with Collapsible */}
              <Collapsible defaultOpen={isActionRequiredTab}>
                <CollapsibleTrigger asChild>
                  <Link href="/dashboard" className={`
                    flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors
                    ${isActionRequiredTab
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }
                `}>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5" />
                      <span>Action Required</span>
                      {getTotalActionCount() > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs min-w-[1.25rem] h-5">
                          {getTotalActionCount()}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight />
                  </Link>
                </CollapsibleTrigger>

                {isDashboardPage && (
                  <CollapsibleContent className="pl-8 space-y-1 mt-1">
                    <Link
                      href="/dashboard?tab=assigned"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                          ${currentTab === 'assigned'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Target className="w-4 h-4" />
                      Assigned
                      <Badge
                        variant={getBadgeCount('assigned') > 0 ? "default" : "secondary"}
                        className="ml-auto text-xs"
                      >
                        {getBadgeContent('assigned')}
                      </Badge>
                    </Link>
                    <Link
                      href="/dashboard?tab=mentions"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                          ${currentTab === 'mentions'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mentions
                      <Badge
                        variant={getBadgeCount('mentions') > 0 ? "default" : "secondary"}
                        className="ml-auto text-xs"
                      >
                        {getBadgeContent('mentions')}
                      </Badge>
                    </Link>
                    <Link
                      href="/dashboard?tab=stale"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                          ${currentTab === 'stale'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Clock className="w-4 h-4" />
                      Stale PRs
                      <Badge
                        variant={getBadgeCount('stale') > 0 ? "destructive" : "secondary"}
                        className="ml-auto text-xs"
                      >
                        {getBadgeContent('stale')}
                      </Badge>
                    </Link>
                  </CollapsibleContent>
                )}
              </Collapsible>

              <Collapsible defaultOpen={isQuickWinsTab}>
                <CollapsibleTrigger asChild>
                  <Link href="/dashboard?tab=good-first-issues" className={`
                    flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors
                    ${isQuickWinsTab
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }
                `}>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5" />
                      <span>Quick Wins</span>
                      {(getBadgeCount('goodFirstIssues') + getBadgeCount('easyFixes')) > 0 && (
                        <Badge variant="default" className="ml-1 text-xs min-w-[1.25rem] h-5">
                          {getBadgeCount('goodFirstIssues') + getBadgeCount('easyFixes')}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${currentTab === 'quick-wins' ? 'rotate-90' : ''}`} />
                  </Link>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-8 space-y-1 mt-1">
                  <Link
                    href="/dashboard?tab=good-first-issues"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${currentTab === 'good-first-issues'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                    <Target className="w-4 h-4" />
                    <span className="font-medium">Good First Issues</span>
                    <Badge
                      variant={getBadgeCount('goodFirstIssues') > 0 ? "default" : "secondary"}
                      className="ml-auto text-xs">
                      {getBadgeContent('goodFirstIssues')}
                    </Badge>
                  </Link>
                  <Link
                    href="/dashboard?tab=easy-fixes"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${currentTab === 'easy-fixes'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Easy Fixes</span>
                    <Badge
                      variant={getBadgeCount('easyFixes') > 0 ? "default" : "secondary"}
                      className="ml-auto text-xs">
                      {getBadgeContent('easyFixes')}
                    </Badge>
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              {/* Coming Soon Items - Disabled Collapsibles */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5" />
                      <span>Favorites</span>
                    </div>
                    <span className="text-xs">Soon</span>
                  </div>
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <span>Recent</span>
                    </div>
                    <span className="text-xs">Soon</span>
                  </div>
                </CollapsibleTrigger>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      <span>Discovery</span>
                    </div>
                    <span className="text-xs">Soon</span>
                  </div>
                </CollapsibleTrigger>
              </Collapsible>
            </nav>
          </div>
        </div>

        {/* Logout - Fixed at bottom */}
        {hasHydrated && isConnected && (
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
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