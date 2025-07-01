'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ContributorGrid } from '@/components/contributors/ContributorGrid'
import { SearchBar } from '@/components/common/SearchBar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useGitHub } from '@/hooks/useGitHub'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { GitHubUser, ContributorWithRepos } from '@/types/github'
import { OrgData } from '@/types/auth'

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<ContributorWithRepos[]>([])
  const [filteredContributors, setFilteredContributors] = useState<ContributorWithRepos[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { fetchOrgData, fetchRepoContributors, loading } = useGitHub()
  const [orgData] = useLocalStorage<OrgData | null>('github-org-data', null)

  useEffect(() => {
    if (orgData?.orgName) {
      loadContributors()
    }
  }, [orgData])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [contributors, activeFilter, searchQuery])

  const loadContributors = async () => {
    if (!orgData) return
    
    try {
      const data = await fetchOrgData(orgData.orgName, orgData.token)
      const allContributors: ContributorWithRepos[] = []
      
      for (const repo of data.repositories.slice(0, 10)) {
        const repoContributors = await fetchRepoContributors(orgData.orgName, repo.name, orgData.token)
        repoContributors.forEach((contributor: GitHubUser) => {
          const existing = allContributors.find(c => c.id === contributor.id)
          if (existing) {
            existing.contributions = (existing.contributions || 0) + (contributor.contributions || 0)
          } else {
            allContributors.push({
              ...contributor,
              repos: [repo.name]
            })
          }
        })
      }
      
      setContributors(allContributors)
    } catch (error) {
      console.error('Katkıcılar yüklenemedi:', error)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...contributors]

    if (searchQuery) {
      filtered = filtered.filter(contributor =>
        contributor.login.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (activeFilter === 'active') {
      filtered = filtered.filter(contributor => (contributor.contributions || 0) > 5)
    }

    filtered.sort((a, b) => (b.contributions || 0) - (a.contributions || 0))
    setFilteredContributors(filtered)
  }

  return (
    <Layout>
      <div>
        <h2 className="text-xl font-semibold mb-4">Katkıda Bulunanlar ({contributors.length})</h2>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
            >
              Tüm Katkıcılar
            </Button>
            <Button 
              variant={activeFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('active')}
            >
              Aktif (5+ commit)
            </Button>
          </div>
          
          <SearchBar 
            onSearch={setSearchQuery} 
            placeholder="Katkıcı ara..."
          />
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ContributorGrid contributors={filteredContributors} />
        )}
      </div>
    </Layout>
  )
}