'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { IssueItem } from '@/components/issues/IssueItem'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SearchBar } from '@/components/common/SearchBar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useGitHub } from '@/hooks/useGitHub'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { GitHubIssue } from '@/types/issue'
import { OrgData } from '@/types/auth'
import { GitHubRepo } from '@/types/github'

export default function IssuesPage() {
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<GitHubIssue[]>([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  
  const { fetchOrgData, loading } = useGitHub()
  const [orgData] = useLocalStorage<OrgData | null>('github-org-data', null)

  useEffect(() => {
    if (orgData?.orgName) {
      loadIssues()
    }
  }, [orgData])

  useEffect(() => {
    applyFilters()
  }, [issues, filter, searchQuery])

  const loadIssues = async () => {
    if (!orgData) return
    
    try {
      const data = await fetchOrgData(orgData.orgName, orgData.token)
      setRepositories(data.repositories)
      
      const allIssues: GitHubIssue[] = []
      for (const repo of data.repositories.slice(0, 5)) {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${orgData.orgName}/${repo.name}/issues?per_page=50&state=all`,
            {
              headers: orgData.token ? { 'Authorization': `token ${orgData.token}` } : {}
            }
          )
          if (response.ok) {
            const repoIssues: GitHubIssue[] = await response.json()
            allIssues.push(...repoIssues.map((issue: GitHubIssue) => ({ ...issue, repoName: repo.name })))
          }
        } catch (error) {
          console.warn(`${repo.name} için issues alınamadı:`, error)
        }
      }
      
      setIssues(allIssues)
    } catch (error) {
      console.error('Issues yüklenemedi:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...issues]

    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.user.login.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    switch (filter) {
      case 'issues':
        filtered = filtered.filter(issue => !issue.pull_request)
        break
      case 'prs':
        filtered = filtered.filter(issue => issue.pull_request)
        break
      case 'open':
        filtered = filtered.filter(issue => issue.state === 'open')
        break
      case 'closed':
        filtered = filtered.filter(issue => issue.state === 'closed')
        break
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFilteredIssues(filtered)
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Issues & Pull Requests ({issues.length})</h2>
          
          <div className="flex items-center space-x-4">
            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder="Issue ara..."
            />
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="issues">Issues</SelectItem>
                <SelectItem value="prs">Pull Requests</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Card>
            <CardContent className="p-0">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {searchQuery || filter !== 'all' 
                    ? 'Bu kriterlere uyan issue bulunamadı.'
                    : 'Henüz issue bulunamadı.'
                  }
                </div>
              ) : (
                <div>
                  {filteredIssues.map(issue => (
                    <IssueItem key={issue.id} issue={issue} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}