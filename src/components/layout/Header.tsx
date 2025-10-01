'use client'

import { useRouter } from 'next/navigation'
import { RateLimitWarning } from '@/components/common/RateLimitWarning'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useSearchStore } from '@/stores'
import { Button } from '../ui/button'
import { Search, User } from 'lucide-react'
import { AnimatedLogo } from '../ui/animated-logo'


export function Header() {
  const {
    setSearchModalOpen,

  } = useSearchStore()

  const router = useRouter()
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-0.5">
          <div className="flex items-center space-x-4">
            <AnimatedLogo />
          </div>
          {/* Search Bar */}
          <Button
            variant="outline"
            onClick={() => setSearchModalOpen(true)}
            className="w-64 flex justify-start "
          >
            <Search className="w-20 h-20 mr-5" />
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