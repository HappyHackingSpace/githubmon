'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TrendingRepo } from '@/types/oss-insight'
import { Skeleton } from '@/components/ui/skeleton'


interface TrendingReposProps {
  repos: TrendingRepo[]
  period: '24h' | '7d' | '30d'
  setPeriod: (period: '24h' | '7d' | '30d') => void
  loading?: boolean
}

export function TrendingRepos({ repos, period, setPeriod, loading = false }: TrendingReposProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">🔥 Trending Repositories</h3>
        <Select value={period} onValueChange={(value: '24h' | '7d' | '30d') => setPeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))
        ) : (
          <>
            {repos.map((repo, index) => (
              <Card key={repo.full_name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    {repo.stars_increment && repo.stars_increment > 0 && (
                      <Badge variant="default">+{repo.stars_increment} ⭐</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {repo.full_name}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm">⭐ {repo.stargazers_count.toLocaleString()}</span>
                      {repo.language && (
                        <Badge variant="outline">{repo.language}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {repos.length === 0 && (
              <div className="py-6 text-center text-gray-500">
                No trending repositories available.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// This component renders repository cards using a responsive grid layout