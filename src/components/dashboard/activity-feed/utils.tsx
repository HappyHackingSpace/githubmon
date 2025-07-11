// src/components/dashboard/activity-feed/utils.tsx
import React from 'react'
import {
    GitBranch,
    Bug,
    GitFork,
    Star,
    FileText,
    Zap,
    Package,
    ArrowRight
} from 'lucide-react'
import type { GitHubEvent } from '@/types/oss-insight'
import type { TechContext } from './types'

// Context detection for technology and domain
export const detectTechContext = (event: GitHubEvent): { context: TechContext | null, confidence: number } => {
    return {
        context: null,
        confidence: 0
    }
}

// Event display formatting with Lucide icons
export const getEventDisplay = (event: GitHubEvent): { icon: React.ReactNode, actionText: string } => {
    switch (event.type) {
        case 'ReleaseEvent':
            return { icon: <Package className="w-4 h-4 text-green-600" />, actionText: 'released new version' }
        case 'CreateEvent':
            if (event.payload.ref_type === 'tag') {
                return { icon: <Package className="w-4 h-4 text-blue-600" />, actionText: 'tagged new release' }
            }
            return { icon: <FileText className="w-4 h-4 text-indigo-600" />, actionText: 'created repository' }
        case 'PullRequestEvent':
            return {
                icon: <GitBranch className="w-4 h-4 text-purple-600" />,
                actionText: event.payload.action === 'closed' ? 'merged pull request' : 'opened pull request'
            }
        case 'IssuesEvent':
            return {
                icon: <Bug className="w-4 h-4 text-red-600" />,
                actionText: `${event.payload.action} issue`
            }
        case 'ForkEvent':
            return { icon: <GitFork className="w-4 h-4 text-orange-600" />, actionText: 'forked repository' }
        case 'WatchEvent':
            return { icon: <Star className="w-4 h-4 text-yellow-600" />, actionText: 'starred repository' }
        case 'PushEvent': {
            const commits = event.payload.size || 0
            return {
                icon: <Zap className="w-4 h-4 text-blue-600" />,
                actionText: `pushed ${commits} commit${commits !== 1 ? 's' : ''}`
            }
        }
        default:
            return { icon: <ArrowRight className="w-4 h-4 text-gray-600" />, actionText: 'performed action' }
    }
}

// Time formatting
export const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
}
