'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { RepositoryGrid } from '@/components/repositories/RepositoryGrid'
import { RepositoryFilters } from '@/components/repositories/RepositoryFilters'
import { SearchBar } from '@/components/common/SearchBar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useGitHub } from '@/hooks/useGitHub'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { GitHubRepo } from '@/types/github'
import { OrgData } from '@/types/auth'

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { fetchOrgData, loading } = useGitHub()
  const [orgData] = useLocalStorage<OrgData | null>('github-org-data', null)

  useEffect(() => {
    if (orgData?.orgName) {
      loadRepositories()
    }
  }, [orgData])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [repositories, currentFilter, searchQuery])

  const loadRepositories = async () => {
    if (!orgData) return
    
    try {
      const data = await fetchOrgData(orgData.orgName, orgData.token)
      setRepositories(data.repositories)
    } catch (error) {
      console.error('Repolar yüklenemedi:', error)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...repositories]

    if (searchQuery) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    switch (currentFilter) {
      case 'updated':
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        break
      case 'stars':
        filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
        break
      case 'forks':
        filtered.sort((a, b) => b.forks_count - a.forks_count)
        break
      case 'issues':
        filtered.sort((a, b) => b.open_issues_count - a.open_issues_count)
        break
    }

    setFilteredRepos(filtered)
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tüm Repolar ({repositories.length})</h2>
          <div className="flex items-center space-x-4">
            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder="Repo ara..."
            />
            <RepositoryFilters 
              onFilterChange={setCurrentFilter}
              currentFilter={currentFilter}
            />
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <RepositoryGrid repositories={filteredRepos} />
        )}
      </div>
    </Layout>
  )
}