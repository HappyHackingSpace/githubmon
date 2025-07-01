import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitHubRepo } from '@/types/github'

interface RepositoryCardProps {
  repo: GitHubRepo
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base">
              <a href={repo.html_url} target="_blank" className="hover:text-indigo-600">
                {repo.name}
              </a>
            </h3>
            <p className="text-sm text-gray-500 mt-1">{repo.description || 'Açıklama yok'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">⭐ {repo.stargazers_count}</div>
            <div className="text-sm text-gray-600">🔀 {repo.forks_count}</div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge variant={repo.private ? 'destructive' : 'default'}>
              {repo.private ? 'Özel' : 'Açık'}
            </Badge>
            {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}