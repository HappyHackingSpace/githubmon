'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSidebarState, useAuthStore, useStoreHydration, useActionItemsStore } from '@/stores'
import { useQuickWinsStore } from '@/stores/quickWins'
import { ChevronRight, Clock, LogOut, MessageSquare, Sparkles, Star, Target, Zap, Home, UserCheck, Lightbulb, Wrench } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export function Sidebar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { isOpen, setOpen } = useSidebarState()

  const hasHydrated = useStoreHydration()
  const { isConnected, logout } = useAuthStore()

  const { getCountByType, loading } = useActionItemsStore()

  const { goodIssues, easyFixes, loading: quickWinsLoading } = useQuickWinsStore()

  const [actionRequiredOpen, setActionRequiredOpen] = useState(false)
  const [quickWinsOpen, setQuickWinsOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/dashboard') {
      setActionRequiredOpen(false)
      setQuickWinsOpen(false)
    }
  }, [pathname])

  const currentTab = searchParams?.get('tab') || 'assigned'

  const getBadgeCount = (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => {
    if (!hasHydrated) return 0
    
    if (type === 'goodFirstIssues') return goodIssues.length
    if (type === 'easyFixes') return easyFixes.length
    return getCountByType(type)
  }

  const getActionRequiredTotal = () => {
    if (!hasHydrated) return 0
    return getBadgeCount('assigned') + getBadgeCount('mentions') + getBadgeCount('stale')
  }
  
  const getQuickWinsTotal = () => {
    if (!hasHydrated) return 0
    return getBadgeCount('goodFirstIssues') + getBadgeCount('easyFixes')
  }

  const getBadgeContent = (type: 'assigned' | 'mentions' | 'stale' | 'goodFirstIssues' | 'easyFixes') => {
    if (!hasHydrated) return 0
    
    if (type === 'goodFirstIssues' || type === 'easyFixes') {
      if (quickWinsLoading.goodIssues || quickWinsLoading.easyFixes) return '...'
    } else {
      if (loading[type]) return '...'
    }
    return getBadgeCount(type) || 0
  }

  const isQuickWinsTab = pathname === '/quick-wins'
  const isActionRequiredTab = pathname === '/action-required'

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
        fixed top-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out
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
          <div className="p-3">
            <nav className="space-y-2">
              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${pathname === '/dashboard'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              {/* Action Required Accordion */}
              <Collapsible open={actionRequiredOpen} onOpenChange={setActionRequiredOpen}>
                <CollapsibleTrigger className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors cursor-pointer
                  ${isActionRequiredTab
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }
                `}>
                  <div className="flex items-center  gap-1 ">
                    <Zap className="w-5 h-5" />
                    <span>Action Required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs min-w-[1.25rem] h-5 bg-muted/30 border-muted-foreground/20">
                      {getActionRequiredTotal()}
                    </Badge>
                    <ChevronRight className={`w-4 h-4 transition-transform ${actionRequiredOpen ? 'rotate-90' : ''}`} />
                  </div>
                </CollapsibleTrigger>

                {/* Action Required sub-items */}
                <CollapsibleContent className="pl-8 space-y-1 mt-1">
                  <Link
                    href="/action-required?tab=assigned"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${(pathname === '/action-required' && currentTab === 'assigned')
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Assigned
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                    >
                      {getBadgeContent('assigned')}
                    </Badge>
                  </Link>
                  <Link
                    href="/action-required?tab=mentions"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${(pathname === '/action-required' && currentTab === 'mentions')
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Mentions
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                    >
                      {getBadgeContent('mentions')}
                    </Badge>
                  </Link>
                  <Link
                    href="/action-required?tab=stale"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${(pathname === '/action-required' && currentTab === 'stale')
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Clock className="w-4 h-4" />
                    Stale PRs
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
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
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs min-w-[1.25rem] h-5 bg-muted/30 border-muted-foreground/20">
                      {getQuickWinsTotal()}
                    </Badge>
                    <ChevronRight className={`w-4 h-4 transition-transform ${quickWinsOpen ? 'rotate-90' : ''}`} />
                  </div>
                </CollapsibleTrigger>

                {/* Quick Wins sub-items */}
                <CollapsibleContent className="pl-8 space-y-1 mt-1">
                  <Link
                    href="/quick-wins?tab=good-issues"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${(pathname === '/quick-wins' && currentTab === 'good-issues')
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">Good First Issues</span>
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs bg-muted/30 border-muted-foreground/20">
                      {getBadgeContent('goodFirstIssues')}
                    </Badge>
                  </Link>
                    <Link
                    href="/quick-wins?tab=easy-fixes"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${(pathname === '/quick-wins' && currentTab === 'easy-fixes')
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                    <Wrench className="w-4 h-4" />
                    <span className="font-medium">Easy Fixes</span>
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs bg-muted/30 border-muted-foreground/20">
                      {getBadgeContent('easyFixes')}
                    </Badge>
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              {/* Settings Link */}
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${pathname.startsWith('/settings')
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }`}
              >
                <Wrench className="w-5 h-5" />
                <span>Settings</span>
                
              </Link>


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

        {/* Footer - Logout Button */}
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

