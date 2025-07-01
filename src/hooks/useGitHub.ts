'use client'

import { useState } from 'react'
import { fetchFromGitHub } from '@/lib/api/github-client'
import { GitHubRepo, GitHubUser, GitHubCommit } from '@/types/github'

export function useGitHub() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrgData = async (orgName: string, token?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const [orgData, repos] = await Promise.all([
        fetchFromGitHub(`orgs/${orgName}`, token).catch(() => 
          fetchFromGitHub(`users/${orgName}`, token)
        ),
        fetchFromGitHub(`orgs/${orgName}/repos?per_page=100&sort=updated`, token).catch(() =>
          fetchFromGitHub(`users/${orgName}/repos?per_page=100&sort=updated`, token)
        )
      ])

      return { organization: orgData, repositories: repos }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchRepoCommits = async (orgName: string, repoName: string, token?: string) => {
    try {
      const commits = await fetchFromGitHub(
        `repos/${orgName}/${repoName}/commits?per_page=100`,
        token
      )
      return commits.map((commit: any) => ({ ...commit, repoName }))
    } catch (err) {
      console.warn(`${repoName} için commits alınamadı:`, err)
      return []
    }
  }

  const fetchRepoContributors = async (orgName: string, repoName: string, token?: string) => {
    try {
      return await fetchFromGitHub(
        `repos/${orgName}/${repoName}/contributors?per_page=100`,
        token
      )
    } catch (err) {
      console.warn(`${repoName} için contributors alınamadı:`, err)
      return []
    }
  }

  return {
    loading,
    error,
    fetchOrgData,
    fetchRepoCommits,
    fetchRepoContributors
  }
}