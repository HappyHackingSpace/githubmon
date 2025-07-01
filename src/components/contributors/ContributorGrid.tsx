import { ContributorCard } from './ContributorCard'
import { ContributorWithRepos } from '@/types/github'

interface ContributorGridProps {
  contributors: ContributorWithRepos[]
}

export function ContributorGrid({ contributors }: ContributorGridProps) {
  if (contributors.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Henüz katkıcı bulunamadı.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {contributors.map((contributor) => (
        <ContributorCard key={contributor.id} contributor={contributor} />
      ))}
    </div>
  )
}