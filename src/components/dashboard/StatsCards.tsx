import { Card, CardContent } from '@/components/ui/card'

interface StatsCardsProps {
  totalRepos?: number
  totalCommits?: number
  totalContributors?: number
  totalStars?: number
}

export function StatsCards({ totalRepos = 0, totalCommits = 0, totalContributors = 0, totalStars = 0 }: StatsCardsProps) {
  const stats = [
    { label: 'Toplam Repo', value: totalRepos, icon: '📁', color: 'indigo' },
    { label: 'Toplam Commit', value: totalCommits, icon: '💻', color: 'green' },
    { label: 'Katkıda Bulunanlar', value: totalContributors, icon: '👥', color: 'blue' },
    { label: 'Toplam Yıldız', value: totalStars, icon: '⭐', color: 'yellow' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}