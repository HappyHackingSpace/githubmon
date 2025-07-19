'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RateLimitWarning } from '@/components/common/RateLimitWarning'
import { SearchModal } from '@/components/search/SearchModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useSearchStore, useAuthStore, useStoreHydration } from '@/stores'
import { Button } from '../ui/button'
import { Search, User, LogOut, BarChart3 } from 'lucide-react'


export function SearchHeader() {
  const {
    currentQuery,
    currentSearchType,
    setSearchModalOpen,
    setCurrentQuery,
    setCurrentSearchType
  } = useSearchStore()

  const { isConnected, orgData, logout } = useAuthStore()
  const hasHydrated = useStoreHydration()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchModalOpen(true)
  }

  const handleInputClick = () => {
    setSearchModalOpen(true)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">GitHubMon</h1>
            <Badge variant="secondary">OSS Analytics</Badge>
          </div>
          {/* Search Bar */}
          <Button
            variant="outline"
            onClick={() => setSearchModalOpen(true)}
            className="w-64 flex justify-start "
          >
            <Search className="w-6 h-6 mr-2" />
            Search GitHub ...
          </Button>

          {/* Rate Limit Warning */}
          <div className="flex items-center space-x-3">
            <RateLimitWarning />
            <ThemeToggle />

            {/* Auth buttons - only show when hydrated */}
            {hasHydrated && (
              isConnected && orgData ? (
                // Logged in user
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center space-x-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/settings')}
                    className="flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>{orgData.orgName}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                // Not logged in
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="flex items-center space-x-1"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}