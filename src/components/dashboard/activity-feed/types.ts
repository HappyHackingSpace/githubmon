// src/components/dashboard/activity-feed/types.ts
import type { GitHubEvent } from '@/types/oss-insight'

export interface ActivityFeedWidgetProps {
    events: GitHubEvent[]
    maxItems?: number
}

export interface TechContext {
    technology: string[]
    domain: string
    iconColor: string
    keywords: string[]
}

export interface EnhancedEvent extends GitHubEvent {
    importance: 'high' | 'medium' | 'low'
    importanceScore: number
    eventIcon: React.ReactNode
    actionText: string
    timeAgo: string
    techContext?: TechContext
    contextConfidence?: number
}

export interface EventPattern {
    type: 'push_cluster' | 'fork_wave' | 'issue_storm' | 'release_train'
    events: EnhancedEvent[]
    summary: string
    icon: React.ReactNode
    importance: 'high' | 'medium' | 'low'
    timeWindow: string
    participants: string[]
    techContext?: TechContext
}
