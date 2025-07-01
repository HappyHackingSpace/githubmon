'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { CommitTable } from '@/components/commits/CommitTable'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGitHub } from '@/hooks/useGitHub'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { GitHubCommit, GitHubRepo } from '@/types/github'
import { OrgData } from '@/types/auth'

export default function CommitsPage() {
  const [commits, setCommits] = useState<(GitHubCommit & { repoName: string })[]>([])
  const [filteredCommits, setFilteredCommits] = useState<(GitHubCommit & { repoName: string })[]>([])
  const [selectedRepo, setSelectedRepo] = useState('all')
  const [timeFilter, setTimeFilter] = useState('30')
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  
  const { fetchOrgData, fetchRepoCommits, loading } = useGitHub()
  const [orgData] = useLocalStorage<OrgData | null>('github-org-data', null)

  useEffect(() => {
    if (orgData?.orgName) {
      loadCommits()
    }
  }, [orgData, timeFilter])

  useEffect(() => {
    applyFilters()
  }, [commits, selectedRepo])

  const loadCommits = async () => {
    if (!orgData) return
    
    try {
      const data = await fetchOrgData(orgData.orgName, orgData.token)
      setRepositories(data.repositories)
      
      const allCommits: (GitHubCommit & { repoName: string })[] = []
      for (const repo of data.repositories.slice(0, 5)) {
        const repoCommits = await fetchRepoCommits(orgData.orgName, repo.name, orgData.token)
        allCommits.push(...repoCommits)
      }
      
      const filteredByTime = allCommits.filter(commit => {
        const commitDate = new Date(commit.commit.author.date)
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeFilter))
        return commitDate >= daysAgo
      })
      
      setCommits(filteredByTime)
    } catch (error) {
      console.error('Commitler yüklenemedi:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...commits]
    
    if (selectedRepo !== 'all') {
      filtered = filtered.filter(commit => commit.repoName === selectedRepo)
    }
    
    filtered.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
    setFilteredCommits(filtered)
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Commit Geçmişi ({commits.length})</h2>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Repo seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Repolar</SelectItem>
                {repositories.map(repo => (
                  <SelectItem key={repo.id} value={repo.name}>{repo.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Son 7 Gün</SelectItem>
                <SelectItem value="30">Son 30 Gün</SelectItem>
                <SelectItem value="90">Son 90 Gün</SelectItem>
                <SelectItem value="365">Son 1 Yıl</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <CommitTable commits={filteredCommits} />
        )}
      </div>
    </Layout>
  )
}