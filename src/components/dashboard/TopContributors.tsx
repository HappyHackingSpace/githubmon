import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubUser } from '@/types/github'

interface TopContributorsProps {
  contributors: GitHubUser[]
  limit?: number
}

export function TopContributors({ contributors, limit = 5 }: TopContributorsProps) {
  const sortedContributors = [...contributors]
    .sort((a, b) => (b.contributions || 0) - (a.contributions || 0))
    .slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>En Aktif Katkıcılar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedContributors.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz katkıcı bulunamadı.</p>
        ) : (
          sortedContributors.map(contributor => (
            <div key={contributor.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={contributor.avatar_url} 
                  alt={contributor.login}
                  className="w-8 h-8 rounded-full"
                />
                <a 
                  href={contributor.html_url} 
                  target="_blank" 
                  className="ml-3 text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  {contributor.login}
                </a>
              </div>
              <div className="text-sm text-gray-500">
                {contributor.contributions || 0} commit
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}