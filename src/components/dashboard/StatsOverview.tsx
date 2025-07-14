'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Folder,
    Star,
    GitFork,
    TrendingUp,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardStats {
    totalRepos: number
    totalStars: number
    totalForks: number
    activeRepos: number
    trendingCount: number
    healthyReposPercentage: number
    trends?: {
        repos?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string }
        stars?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string }
        forks?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string }
        trending?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string }
        health?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string }
    }
}

interface StatsOverviewProps {
    stats: DashboardStats
    loading?: boolean
}

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description?: string
    trend?: {
        value: number
        direction: 'up' | 'down' | 'neutral'
        label: string
    }
    chartData?: number[]
    color?: 'blue' | 'amber' | 'green' | 'purple' | 'pink' | 'teal'
}

function getStopColor(color: string = 'blue') {
    const colorMap: Record<string, string> = {
        blue: '#3b82f6',
        amber: '#f59e0b',
        green: '#10b981',
        purple: '#8b5cf6',
        pink: '#ec4899',
        teal: '#14b8a6'
    }
    return colorMap[color] || colorMap.blue
}

function MiniChart({ data, color = 'blue' }: {
    data: number[],
    color?: 'blue' | 'amber' | 'green' | 'purple' | 'pink' | 'teal'
}) {
    if (!data || data.length === 0) {
        return <div className="h-4 w-full" />
    }

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const colorClasses = {
        blue: 'stroke-blue-500',
        amber: 'stroke-amber-500',
        green: 'stroke-green-500',
        purple: 'stroke-purple-500',
        pink: 'stroke-pink-500',
        teal: 'stroke-teal-500'
    }

    return (
        <div className="h-4 w-full">
            <svg
                className="w-full h-full"
                viewBox="0 0 100 30"
                preserveAspectRatio="none"
                role="img"
                aria-label="Mini chart showing data trend"
            >
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}
                    points={data.map((value, index) => {
                        const x = (index / (data.length - 1)) * 100
                        const y = 30 - ((value - min) / range) * 25
                        return `${x},${y}`
                    }).join(' ')}
                />
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={getStopColor(color)} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={getStopColor(color)} stopOpacity="0.05" />
                    </linearGradient>
                </defs>
                <polygon
                    fill={`url(#gradient-${color})`}
                    points={`0,30 ${data.map((value, index) => {
                        const x = (index / (data.length - 1)) * 100
                        const y = 30 - ((value - min) / range) * 25
                        return `${x},${y}`
                    }).join(' ')} 100,30`}
                />
            </svg>
        </div>
    )
}

function StatCard({ title, value, icon, description, trend, chartData, color = 'blue' }: StatCardProps) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (typeof value !== 'number') {
            return
        }

        const duration = 1500
        const steps = 50
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value])

    const formatDisplayValue = () => {
        const numValue = typeof value === 'number' ? displayValue : parseFloat(value.toString())
        if (numValue >= 1000000) {
            return `${(numValue / 1000000).toFixed(1)}M`
        } else if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(0)}K`
        }
        return typeof value === 'number' ? displayValue.toLocaleString() : value
    }

    const getTrendIcon = () => {
        if (!trend) return null
        switch (trend.direction) {
            case 'up':
                return <ArrowUpRight className="w-3 h-3" />
            case 'down':
                return <ArrowDownRight className="w-3 h-3" />
            default:
                return <Minus className="w-3 h-3" />
        }
    }

    const getTrendColor = () => {
        if (!trend) return 'text-gray-500'
        switch (trend.direction) {
            case 'up':
                return 'text-green-600 bg-green-50'
            case 'down':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-900">
            <CardContent className="p-2">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1">
                        <div className="p-0.5 rounded-md bg-gray-50 dark:bg-gray-800">
                            {icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {title}
                            </p>
                        </div>
                    </div>
                    {trend && (
                        <Badge variant="secondary" className={`text-[10px] px-1 py-0 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            {Math.abs(trend.value)}%
                        </Badge>
                    )}
                </div>

                <div className="mb-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                        {formatDisplayValue()}
                    </div>
                    {description && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                {chartData && (
                    <div className="mb-0.5">
                        <MiniChart data={chartData} color={color} />
                    </div>
                )}

                {trend && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {trend.label}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export function StatsOverview({ stats, loading = false }: StatsOverviewProps) {
    // Mock chart data - replace with real data
    const repoChartData = [45, 52, 48, 61, 58, 67, 65, 72]
    const starChartData = [120, 135, 142, 155, 148, 162, 171, 180]
    const forkChartData = [25, 30, 28, 35, 42, 38, 45, 52]

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-gray-50 dark:bg-gray-800 animate-pulse border-0">
                        <CardContent className="p-2">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                                    <div className="w-12 h-2 bg-gray-300 dark:bg-gray-700 rounded" />
                                </div>
                                <div className="w-14 h-5 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <StatCard
                    title="Repositories"
                    value={stats.totalRepos}
                    icon={<Folder className="w-3 h-3 text-blue-600" />}
                    description="Total repositories"
                    trend={stats.trends?.repos || { value: 12, direction: 'up', label: "vs last month" }}
                    chartData={repoChartData}
                    color="blue"
                />

                <StatCard
                    title="Stars"
                    value={stats.totalStars}
                    icon={<Star className="w-3 h-3 text-amber-500" />}
                    description="Total stars received"
                    trend={stats.trends?.stars || { value: 8.5, direction: 'up', label: "vs last week" }}
                    chartData={starChartData}
                    color="amber"
                />

                <StatCard
                    title="Forks"
                    value={stats.totalForks}
                    icon={<GitFork className="w-3 h-3 text-green-600" />}
                    description="Total forks created"
                    trend={stats.trends?.forks || { value: 15.2, direction: 'up', label: "vs last month" }}
                    chartData={forkChartData}
                    color="green"
                />

                <StatCard
                    title="Active Repos"
                    value={stats.activeRepos}
                    icon={<Activity className="w-3 h-3 text-purple-600" />}
                    description="Recently updated"
                    color="purple"
                />


            </div>
        </div>
    )
}


