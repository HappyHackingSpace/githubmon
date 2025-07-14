// src/components/dashboard/activity-feed/ActivityEventItem.tsx
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield } from 'lucide-react'
import type { EnhancedEvent } from './types'
import { ImportanceBadge } from './ImportanceBadge'

interface ActivityEventItemProps {
    event: EnhancedEvent
}

export function ActivityEventItem({ event }: ActivityEventItemProps) {
    return (
        <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="size-6">
                        <AvatarImage src={event.actor.avatar_url} alt={event.actor.login} />
                        <AvatarFallback className="text-sm">
                            {event.actor.login.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-base truncate">
                        {event.actor.login}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {event.actionText}
                    </span>
                    <ImportanceBadge importance={event.importance} />
                </div>

                <div className="text-sm">
                    <a
                        href={`https://github.com/${event.repo.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80  font-medium truncate"
                    >
                        {event.repo.name}
                    </a>
                </div>

                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{event.timeAgo}</span>
                    <span>•</span>
                    <span>Score: {event.importanceScore}</span>
                    {event.importance === 'high' && (
                        <>
                            <span>•</span>
                            <Shield className="w-3 h-3 text-orange-500" />
                            <span className="text-orange-600">Priority</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
