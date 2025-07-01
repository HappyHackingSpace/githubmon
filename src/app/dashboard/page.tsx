'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { RecentCommits } from '@/components/dashboard/RecentCommits'
import { PopularRepos } from '@/components/dashboard/PopularRepos'
import { TopContributors } from '@/components/dashboard/TopContributors'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useGitHub } from '@/hooks/useGitHub'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { calculateRepoStats, calculateContributorStats, aggregateCommitsByDate } from '@/lib/utils/stats'
import { GitHubRepo, GitHubUser, GitHubCommit } from '@/types/github'
import { OrgData } from '@/types/auth'

export default function DashboardPage() {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [contributors, setContributors] = useState<GitHubUser[]>([])
  const [commits, setCommits] = useState<(GitHubCommit & { repoName: string })[]>([])
  const [stats, setStats] = useState({
    repos: 0,
    commits: 0,
    contributors: 0,
    stars: 0
  })
  
  const { fetchOrgData, fetchRepoCommits, fetchRepoContributors, loading } = useGitHub()
  const [orgData] = useLocalStorage<OrgData | null>('github-org-data', null)

  useEffect(() => {
    if (orgData?.orgName) {
      loadDashboardData()
    }
  }, [orgData])

  const loadDashboardData = async () => {
    if (!orgData) return
    
    try {
      const data = await fetchOrgData(orgData.orgName, orgData.token)
      setRepositories(data.repositories)
      
      const allCommits: (GitHubCommit & { repoName: string })[] = []
      const allContributors: GitHubUser[] = []
      
      for (const repo of data.repositories.slice(0, 8)) {
        const [repoCommits, repoContributors] = await Promise.all([
          fetchRepoCommits(orgData.orgName, repo.name, orgData.token),
          fetchRepoContributors(orgData.orgName, repo.name, orgData.token)
        ])
        
        allCommits.push(...repoCommits)
        
        repoContributors.forEach((contributor: GitHubUser) => {
          const existing = allContributors.find(c => c.id === contributor.id)
          if (existing) {
            existing.contributions = (existing.contributions || 0) + (contributor.contributions || 0)
          } else {
            allContributors.push(contributor)
          }
        })
      }
      
      setCommits(allCommits)
      setContributors(allContributors)
      
      const repoStats = calculateRepoStats(data.repositories)
      const contributorStats = calculateContributorStats(allContributors)
      
      setStats({
        repos: repoStats.total,
        commits: allCommits.length,
        contributors: contributorStats.total,
        stars: repoStats.totalStars
      })
      
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error)
    }
  }

  if (loading && repositories.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  const commitData = aggregateCommitsByDate(commits)

  return (
    <Layout>
      <div>
        <h2 className="text-xl font-semibold mb-4">Organizasyon İstatistikleri</h2>
        
        <StatsCards 
          totalRepos={stats.repos}
          totalCommits={stats.commits}
          totalContributors={stats.contributors}
          totalStars={stats.stars}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <ActivityChart commitData={commitData} />
          <TopContributors contributors={contributors} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentCommits commits={commits} />
          <PopularRepos repositories={repositories} />
        </div>
      </div>
    </Layout>
  )
}