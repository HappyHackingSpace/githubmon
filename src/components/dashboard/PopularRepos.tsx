import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubRepo } from '@/types/github'

interface PopularReposProps {
  repositories: GitHubRepo[]
  limit?: number
}

export function PopularRepos({ repositories, limit = 5 }: PopularReposProps) {
  const sortedRepos = [...repositories]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Popüler Repolar</CardTitle>
        <a href="/repositories" className="text-indigo-600 text-sm hover:underline">
          Tümünü Gör
        </a>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRepos.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz repo bulunamadı.</p>
        ) : (
          sortedRepos.map(repo => (
            <div key={repo.id} className="flex items-start">
              <div className="flex-shrink-0 pt-1 text-yellow-400">⭐</div>
              <div className="ml-3">
                <a 
                  href={repo.html_url} 
                  target="_blank" 
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  {repo.name}
                </a>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span>{repo.stargazers_count} yıldız</span>
                  <span className="mx-1">•</span>
                  <span>{repo.forks_count} fork</span>
                  {repo.language && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{repo.language}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}