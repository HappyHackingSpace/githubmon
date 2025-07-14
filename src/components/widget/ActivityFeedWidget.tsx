// src/components/dashboard/ActivityFeedWidget.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight } from 'lucide-react'

// Modular imports
import type { ActivityFeedWidgetProps } from '../dashboard/activity-feed/types'
import { useEnhancedEvents, useFilteredEvents, useEventPatterns } from '../dashboard/activity-feed/hooks'
import { FilterButtons } from '../dashboard/activity-feed/FilterButtons'
import { ActivityEventItem } from '../dashboard/activity-feed/ActivityEventItem'
import { EmptyState } from '../dashboard/activity-feed/EmptyState'

export function ActivityFeedWidget({ events, maxItems = 10 }: ActivityFeedWidgetProps) {
    const [filterLevel, setFilterLevel] = useState<'all' | 'medium' | 'high'>('all')

    // Use custom hooks for data processing
    const enhancedEvents = useEnhancedEvents(events)
    const filteredEvents = useFilteredEvents(enhancedEvents, filterLevel, maxItems)
    const eventPatterns = useEventPatterns(enhancedEvents)

    return (
        <Card >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Activity Feed
                        <Badge variant="outline">{filteredEvents.length}</Badge>
                    </CardTitle>

                    <FilterButtons
                        filterLevel={filterLevel}
                        onFilterChange={setFilterLevel}
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-3 overflow-x-hidden">
                {filteredEvents.length === 0 ? (
                    <EmptyState filterLevel={filterLevel} />
                ) : (
                    filteredEvents.map((event) => (
                        <ActivityEventItem key={event.id} event={event} />
                    ))
                )}

                {filteredEvents.length > 0 && (
                    <div className="text-center pt-2">
                        <Button variant="outline" size="sm">
                            <ArrowRight className="w-4 h-4 mr-1" />
                            View All Activity
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}