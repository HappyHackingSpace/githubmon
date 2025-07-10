'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TrendingRepo } from '@/types/oss-insight'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, Code2 } from 'lucide-react'


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
        <h3 className="text-2xl font-bold text-gray-900">Trending Repositories</h3>
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
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ))
        ) : (
          <>
            {repos.map((repo, index) => (
              <Card key={repo.full_name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold truncate">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {repo.full_name}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-sm text-gray-700">
                      <Star size={16} className="text-yellow-500" />
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                    {repo.language && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Code2 size={14} />
                        {repo.language}
                      </span>
                    )}
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