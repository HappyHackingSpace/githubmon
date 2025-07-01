import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContributorWithRepos } from '@/types/github'

interface ContributorCardProps {
  contributor: ContributorWithRepos
}

export function ContributorCard({ contributor }: ContributorCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <img 
            src={contributor.avatar_url} 
            alt={contributor.login}
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-3">
            <h3 className="font-semibold text-base">
              <a href={contributor.html_url} target="_blank" className="hover:text-indigo-600">
                {contributor.login}
              </a>
            </h3>
            <p className="text-sm text-gray-500">{contributor.contributions || 0} commit</p>
          </div>
        </div>
        {contributor.repos && contributor.repos.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">Katkıda bulunduğu repolar:</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {contributor.repos.slice(0, 3).map(repo => (
                <Badge key={repo} variant="outline">{repo}</Badge>
              ))}
              {contributor.repos.length > 3 && (
                <Badge variant="secondary">+{contributor.repos.length - 3} daha</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}