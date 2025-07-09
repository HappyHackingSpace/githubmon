'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RateLimitWarning } from '@/components/common/RateLimitWarning'
import { SearchModal } from '@/components/search/SearchModal'
import { useSearchStore } from '@/stores'


export function SearchHeader() {
  const {
    currentQuery,
    currentSearchType,
    setSearchModalOpen,
    setCurrentQuery,
    setCurrentSearchType
  } = useSearchStore()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchModalOpen(true)
  }

  const handleInputClick = () => {
    setSearchModalOpen(true)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">GitHubMon</h1>
            <Badge variant="secondary">OSS Analytics</Badge>
          </div>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md mx-8">
            <Select value={currentSearchType} onValueChange={(value: 'all' | 'repos' | 'users') => setCurrentSearchType(value)}>

              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="repos">Repositories</SelectItem>
                <SelectItem value="users">Users</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder={`Search ${currentSearchType}...`}
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onClick={handleInputClick}
              readOnly
              className="flex-1 cursor-pointer"
            />
          </form>

          <SearchModal />

          {/* Rate Limit Warning */}
          <div className="flex items-center space-x-3">
            <RateLimitWarning />
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}