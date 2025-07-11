// src/components/dashboard/activity-feed/patterns.tsx
import React from 'react'
import { Zap, GitFork } from 'lucide-react'
import type { EnhancedEvent, EventPattern } from './types'

// Pattern detection logic
export const detectEventPatterns = (events: EnhancedEvent[]): EventPattern[] => {
    const patterns: EventPattern[] = []
    const now = Date.now()

    // Group events by type and time window
    const recentEvents = events.filter(e =>
        (now - new Date(e.created_at).getTime()) < 2 * 60 * 60 * 1000 // Last 2 hours
    )

    // Push Clusters - multiple commits to same repo
    const pushEvents = recentEvents.filter(e => e.type === 'PushEvent')
    const pushByRepo = pushEvents.reduce((acc, event) => {
        const repo = event.repo.name
        if (!acc[repo]) acc[repo] = []
        acc[repo].push(event)
        return acc
    }, {} as Record<string, EnhancedEvent[]>)

    Object.entries(pushByRepo).forEach(([repo, events]) => {
        if (events.length >= 3) {
            const totalCommits = events.reduce((sum, e) => sum + (e.payload.size || 0), 0)
            const participants = [...new Set(events.map(e => e.actor.login))]

            patterns.push({
                type: 'push_cluster',
                events,
                summary: `${participants.length > 1 ? 'Team' : participants[0]} pushed ${totalCommits} commits to ${repo.split('/')[1]}`,
                icon: <Zap className="w-4 h-4 text-orange-500" />,
                importance: totalCommits > 10 ? 'high' : 'medium',
                timeWindow: 'last 2 hours',
                participants
            })
        }
    })

    // Fork Waves - multiple forks of same repo
    const forkEvents = recentEvents.filter(e => e.type === 'ForkEvent')
    const forkByRepo = forkEvents.reduce((acc, event) => {
        const repo = event.repo.name
        if (!acc[repo]) acc[repo] = []
        acc[repo].push(event)
        return acc
    }, {} as Record<string, EnhancedEvent[]>)

    Object.entries(forkByRepo).forEach(([repo, events]) => {
        if (events.length >= 5) {
            const participants = events.map(e => e.actor.login)

            patterns.push({
                type: 'fork_wave',
                events,
                summary: `${events.length} developers forked ${repo.split('/')[1]} in surge`,
                icon: <GitFork className="w-4 h-4 text-blue-500" />,
                importance: events.length > 10 ? 'high' : 'medium',
                timeWindow: 'last 2 hours',
                participants
            })
        }
    })

    return patterns.sort((a, b) => b.events.length - a.events.length)
}
