// src/components/dashboard/activity-feed/hooks.ts
import { useMemo } from 'react'
import type { GitHubEvent } from '@/types/oss-insight'
import type { EnhancedEvent } from './types'
import { calculateEventImportance } from './scoring'
import { getEventDisplay, formatTimeAgo } from './utils'
import { detectEventPatterns } from './patterns'

export function useEnhancedEvents(events: GitHubEvent[]): EnhancedEvent[] {
    return useMemo((): EnhancedEvent[] => {
        return events.map(event => {
            const { importance, score } = calculateEventImportance(event)
            const { icon, actionText } = getEventDisplay(event)
            const timeAgo = formatTimeAgo(event.created_at)

            return {
                ...event,
                importance,
                importanceScore: score,
                eventIcon: icon,
                actionText,
                timeAgo
            }
        })
    }, [events])
}

export function useFilteredEvents(
    enhancedEvents: EnhancedEvent[],
    filterLevel: 'all' | 'medium' | 'high',
    maxItems: number
) {
    return useMemo(() => {
        const filtered = enhancedEvents.filter(event => {
            switch (filterLevel) {
                case 'high': return event.importance === 'high'
                case 'medium': return event.importance === 'high' || event.importance === 'medium'
                case 'all': return true
                default: return true
            }
        })

        return filtered
            .sort((a, b) => b.importanceScore - a.importanceScore)
            .slice(0, maxItems)
    }, [enhancedEvents, filterLevel, maxItems])
}

export function useEventPatterns(enhancedEvents: EnhancedEvent[]) {
    return useMemo(() => {
        return detectEventPatterns(enhancedEvents)
    }, [enhancedEvents])
}
