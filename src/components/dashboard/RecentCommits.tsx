import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubCommit } from '@/types/github'
import { formatRelativeDate } from '@/lib/utils/date'

interface RecentCommitsProps {
  commits: (GitHubCommit & { repoName?: string })[]
  limit?: number
}

export function RecentCommits({ commits, limit = 5 }: RecentCommitsProps) {
  const sortedCommits = [...commits]
    .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
    .slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Son Commitler</CardTitle>
        <a href="/commits" className="text-indigo-600 text-sm hover:underline">
          Tümünü Gör
        </a>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedCommits.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz commit bulunamadı.</p>
        ) : (
          sortedCommits.map(commit => (
            <div key={commit.sha} className="flex items-start">
              <div className="flex-shrink-0 pt-1 text-gray-400">💻</div>
              <div className="ml-3">
                <a 
                  href={commit.html_url} 
                  target="_blank" 
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  {commit.commit.message.split('\n')[0].substring(0, 60)}
                </a>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span>{commit.repoName || '-'}</span>
                  <span className="mx-1">•</span>
                  <span>{formatRelativeDate(commit.commit.author.date)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}