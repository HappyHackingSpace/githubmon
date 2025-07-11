// src/components/dashboard/activity-feed/EmptyState.tsx
import React from 'react'
import { AlertCircle } from 'lucide-react'

interface EmptyStateProps {
    filterLevel: 'all' | 'medium' | 'high'
}

export function EmptyState({ filterLevel }: EmptyStateProps) {
    return (
        <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No {filterLevel !== 'all' ? filterLevel + ' importance' : ''} events found</p>
        </div>
    )
}
