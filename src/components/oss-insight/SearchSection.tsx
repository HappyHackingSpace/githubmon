'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ossInsightClient } from '@/lib/api/oss-insight-client'

interface SearchSectionProps {
  onSearchResults?: (results: any[]) => void
  className?: string
}

export function SearchSection({ onSearchResults, className }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'repos' | 'users' | 'orgs'>('repos')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      let results = []

      if (searchType === 'repos') {
        results = await ossInsightClient.searchRepositories(searchQuery)
      } else {
        results = await ossInsightClient.searchUsers(searchQuery, searchType === 'users' ? 'users' : 'orgs')
      }

      console.log(`${searchType} search results:`, results)
      onSearchResults?.(results)

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="repos">Repositories</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="orgs">Organizations</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder={`${searchType === 'repos' ? 'Search repository' : searchType === 'users' ? 'Search user' : 'Search organization'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />

        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>
    </div>
  )
}