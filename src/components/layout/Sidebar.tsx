'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSidebarState, useAuthStore, useStoreHydration, useActionItemsStore } from '@/stores'
import { ChevronRight, Clock, LogOut, MessageSquare, Sparkles, Star, Target, Zap } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isOpen, setOpen } = useSidebarState()

  // Auth state
  const hasHydrated = useStoreHydration()
  const { isConnected, logout } = useAuthStore()

  // Action items state
  const { getCountByType, loading } = useActionItemsStore()

  // Accordion states - MUI style
  const [actionRequiredOpen, setActionRequiredOpen] = useState(true)
  const [quickWinsOpen, setQuickWinsOpen] = useState(true)

  // Get current tab from URL params
  const currentTab = searchParams?.get('tab') || 'assigned'
  const isDashboardPage = pathname?.startsWith('/dashboard')

  // Badge count helpers - Dinamik hesaplama
  const getBadgeCount = (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => getCountByType(type)
  const getActionRequiredTotal = () => getBadgeCount('assigned') + getBadgeCount('mentions') + getBadgeCount('stale')
  const getQuickWinsTotal = () => getBadgeCount('goodFirstIssues') + getBadgeCount('easyFixes')

  // Show loading state in badges
  const getBadgeContent = (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => {
    if (loading[type]) return '...'
    return getBadgeCount(type)
  }

  // Active states for highlighting (separate from accordion state)
  const isQuickWinsTab = currentTab === 'good-first-issues' || currentTab === 'easy-fixes'
  const isActionRequiredTab = ['assigned', 'mentions', 'stale'].includes(currentTab)

  const handleLogout = () => {
    logout()
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
        fixed top-0 left-0 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col
        h-screen
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

        <div className="flex-1 overflow-y-auto">
          {/* Navigation Menu */}
          <div className="p-4">
            <nav className="space-y-2">
              {/* Action Required Accordion */}
              <Collapsible open={actionRequiredOpen} onOpenChange={setActionRequiredOpen}>
                <CollapsibleTrigger className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors cursor-pointer
                  ${isActionRequiredTab
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }
                `}>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    <span>Action Required</span>
                    {getActionRequiredTotal() > 0 && (
                      <Badge variant="destructive" className="ml-1 text-xs min-w-[1.25rem] h-5">
                        {getActionRequiredTotal()}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${actionRequiredOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>

                {/* Action Required sub-items */}
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
              </Collapsible>

              {/* Quick Wins Accordion */}
              <Collapsible open={quickWinsOpen} onOpenChange={setQuickWinsOpen}>
                <CollapsibleTrigger className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors cursor-pointer
                  ${isQuickWinsTab
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }
                `}>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5" />
                    <span>Quick Wins</span>
                    {getQuickWinsTotal() > 0 && (
                      <Badge variant="default" className="ml-1 text-xs min-w-[1.25rem] h-5">
                        {getQuickWinsTotal()}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${quickWinsOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>

                {/* Quick Wins sub-items */}
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

        {/* Logout - Fixed at bottom with fixed height */}
        {hasHydrated && isConnected && (
          <div className="p-4 border-t border-sidebar-border flex-shrink-0">
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