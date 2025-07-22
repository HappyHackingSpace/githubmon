'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'


import { useSidebarState, useAuthStore, useStoreHydration } from '@/stores'
import {  ChevronRight, Clock, Flame,  LogOut, MessageSquare, Sparkles, Star, Target, Zap,  } from 'lucide-react'
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
  const { isOpen, setOpen } = useSidebarState()

  // Auth state
  const hasHydrated = useStoreHydration()
  const { isConnected,  logout } = useAuthStore()




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
        <Collapsible defaultOpen={pathname === '/dashboard'}>
            <CollapsibleTrigger asChild>
                <Link href="/dashboard" className={`
                    flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors
                `}>
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        <span>Action Required</span>
                    </div>  
                    <ChevronRight className={`w-4 h-4 transition-transform ${pathname === '/dashboard' ? 'rotate-90' : ''}`} />
                </Link>
            </CollapsibleTrigger>
            
            {pathname === '/dashboard' && (
                <CollapsibleContent className="pl-8 space-y-1 mt-1">
                    <Link href="/dashboard?tab=assigned" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 rounded">
                        <Target className="w-4 h-4" />
                        Assigned
                        <Badge variant="secondary" className="ml-auto text-xs">0</Badge>
                    </Link>
                    <Link href="/dashboard?tab=mentions" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 rounded">
                        <MessageSquare className="w-4 h-4" />
                        Mentions
                        <Badge variant="secondary" className="ml-auto text-xs">0</Badge>
                    </Link>
                    <Link href="/dashboard?tab=stale" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 rounded">
                        <Clock className="w-4 h-4" />
                        Stale PRs
                        <Badge variant="secondary" className="ml-auto text-xs">0</Badge>
                    </Link>
                </CollapsibleContent>
            )}
        </Collapsible>

        {/* Coming Soon Items - Disabled Collapsibles */}
        <Collapsible>
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5" />
                        <span>Quick Wins</span>
                    </div>
                    <span className="text-xs">Soon</span>
                </div>
            </CollapsibleTrigger>
        </Collapsible>

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