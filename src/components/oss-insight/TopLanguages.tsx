'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TopLanguage } from '@/types/oss-insight'

interface TopLanguagesProps {
  languages: TopLanguage[]
}

export function TopLanguages({ languages }: TopLanguagesProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  return (
    <section>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">💻 Top Programming Languages</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {languages.map((lang, index) => (
          <Card key={lang.language} className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                <span className="text-lg">{getTrendIcon(lang.trend)}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{lang.language}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>{lang.repos_count.toLocaleString()} repos</div>
                <div>⭐ {lang.stars_count.toLocaleString()}</div>
              </div>
              <Badge 
                variant={lang.trend === 'rising' ? 'default' : lang.trend === 'declining' ? 'destructive' : 'secondary'}
                className="mt-2"
              >
                {lang.trend === 'rising' ? 'Rising' : lang.trend === 'declining' ? 'Declining' : 'Stable'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

// This component displays language statistics with trend indicators