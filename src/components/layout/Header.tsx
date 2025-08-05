'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { RateLimitWarning } from '@/components/common/RateLimitWarning'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useSearchStore } from '@/stores'
import { Button } from '../ui/button'
import { Search, User } from 'lucide-react'


export function Header() {
  const {
    setSearchModalOpen,
 
  } = useSearchStore()


  const router = useRouter()





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


            {/* Auth buttons - only show when hydrated */}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className="flex items-center space-x-1"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}