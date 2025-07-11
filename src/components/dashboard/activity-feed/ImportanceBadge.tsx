// src/components/dashboard/activity-feed/ImportanceBadge.tsx
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Flame, TrendingUp, ArrowRight } from 'lucide-react'

interface ImportanceBadgeProps {
    importance: 'high' | 'medium' | 'low'
}

export function ImportanceBadge({ importance }: ImportanceBadgeProps) {
    switch (importance) {
        case 'high':
            return (
                <Badge variant="destructive" className="text-xs">
                    <Flame className="w-3 h-3 mr-1" />
                    HIGH
                </Badge>
            )
        case 'medium':
            return (
                <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    MED
                </Badge>
            )
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    LOW
                </Badge>
            )
    }
}
