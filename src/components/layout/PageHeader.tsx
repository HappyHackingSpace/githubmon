'use client'

import { Button } from '@/components/ui/button'
// import { Search } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import RefreshButton from '@/components/Refresh/RefreshButton'
import { useSearchStore } from '@/stores'
import { useRequireAuth } from '@/hooks/useAuth'

interface PageHeaderProps {
  onRefresh?: () => void
  showSearch?: boolean
}

export function PageHeader({ onRefresh, showSearch = false }: PageHeaderProps) {
  // const { setSearchModalOpen } = useSearchStore()
  const { orgData } = useRequireAuth()

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4 top-0 z-10">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Good morning, {orgData?.orgName || 'Developer'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* {showSearch && (
          <Button
            variant="outline"
            onClick={() => setSearchModalOpen(true)}
            className="px-6 py-2.5 font-medium text-base"
            size="lg"
          >
            <Search className="w-6 h-6 mr-2" />
            Search
          </Button>
        )}
        {onRefresh && <RefreshButton onRefresh={onRefresh} />} */}
        <ThemeToggle />
      </div>
    </div>
  )
}