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
      
      console.log(`${searchType} arama sonuçları:`, results)
      onSearchResults?.(results)
      
    } catch (error) {
      console.error('Arama hatası:', error)
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
            <SelectItem value="repos">Repolar</SelectItem>
            <SelectItem value="users">Kullanıcılar</SelectItem>
            <SelectItem value="orgs">Organizasyonlar</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="text"
          placeholder={`${searchType === 'repos' ? 'Repository' : searchType === 'users' ? 'Kullanıcı' : 'Organizasyon'} ara...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Arıyor...' : 'Ara'}
        </Button>
      </form>
    </div>
  )
}

// Global yorum: Genel amaçlı arama komponenti, farklı sayfalarda kullanılabilir