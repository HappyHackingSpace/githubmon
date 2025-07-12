// src/components/dashboard/activity-feed/FilterButtons.tsx
import React from 'react'
import { Button } from '@/components/ui/button'

interface FilterButtonsProps {
    filterLevel: 'all' | 'medium' | 'high'
    onFilterChange: (level: 'all' | 'medium' | 'high') => void
}

export function FilterButtons({ filterLevel, onFilterChange }: FilterButtonsProps) {
    return (
        <div className="flex gap-1">
            {(['all', 'medium', 'high'] as const).map((level) => (
                <Button
                    key={level}
                    variant={filterLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onFilterChange(level)}
                    className="text-xs"
                >
                    {level === 'all' ? (
                        'All'
                    ) : level === 'medium' ? (
                        'Key'
                    ) : (
                        'Hot'
                    )}
                </Button>
            ))}
        </div>
    )
}
