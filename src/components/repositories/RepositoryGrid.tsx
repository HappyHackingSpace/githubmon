import { RepositoryCard } from './RepositoryCard'
import { GitHubRepo } from '@/types/github'

interface RepositoryGridProps {
  repositories: GitHubRepo[]
}

export function RepositoryGrid({ repositories }: RepositoryGridProps) {
  if (repositories.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Henüz repo bulunamadı.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}