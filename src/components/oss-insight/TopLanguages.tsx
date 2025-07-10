'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, ArrowRight, Laptop as LaptopIcon, Star } from 'lucide-react'
import type { TopLanguage } from '@/types/oss-insight'

interface TopLanguagesProps {
  languages: TopLanguage[]
}

export function TopLanguages({ languages }: TopLanguagesProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />
      default: return <ArrowRight className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <section>
      <h3 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white gap-2 mb-6">
        <LaptopIcon className="w-6 h-6" />
        Top Programming Languages
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {languages.map((lang, index) => (
          <Card key={lang.language} className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                <div className="flex items-center justify-center">{getTrendIcon(lang.trend)}</div>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">{lang.language}</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>{lang.repos_count.toLocaleString()} repos</div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {lang.stars_count.toLocaleString()}
                </div>
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