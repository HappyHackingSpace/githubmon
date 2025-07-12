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

function MiniChart({ data, color = 'blue' }: { data: number[], color?: string }) {
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
        <div className="h-8 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
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
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                            {icon}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {title}
                            </p>
                        </div>
                    </div>
                    {trend && (
                        <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            {Math.abs(trend.value)}%
                        </Badge>
                    )}
                </div>

                <div className="mb-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {formatDisplayValue()}
                    </div>
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                {chartData && (
                    <div className="mb-2">
                        <MiniChart data={chartData} color={color} />
                    </div>
                )}

                {trend && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-gray-50 dark:bg-gray-800 animate-pulse border-0">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded" />
                                    <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                                </div>
                                <div className="w-20 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="w-full h-6 bg-gray-300 dark:bg-gray-700 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                    title="Repositories"
                    value={stats.totalRepos}
                    icon={<Folder className="w-4 h-4 text-blue-600" />}
                    description="Total repositories"
                    trend={{ value: 12, direction: 'up', label: "vs last month" }}
                    chartData={repoChartData}
                    color="blue"
                />

                <StatCard
                    title="Stars"
                    value={stats.totalStars}
                    icon={<Star className="w-4 h-4 text-amber-500" />}
                    description="Total stars received"
                    trend={{ value: 8.5, direction: 'up', label: "vs last week" }}
                    chartData={starChartData}
                    color="amber"
                />

                <StatCard
                    title="Forks"
                    value={stats.totalForks}
                    icon={<GitFork className="w-4 h-4 text-green-600" />}
                    description="Total forks created"
                    trend={{ value: 15.2, direction: 'up', label: "vs last month" }}
                    chartData={forkChartData}
                    color="green"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Active Repos"
                    value={stats.activeRepos}
                    icon={<Activity className="w-4 h-4 text-purple-600" />}
                    description="Recently updated"
                    color="purple"
                />

                <StatCard
                    title="Trending"
                    value={stats.trendingCount}
                    icon={<TrendingUp className="w-4 h-4 text-pink-600" />}
                    description="Projects gaining traction"
                    trend={{ value: 22, direction: 'up', label: "this week" }}
                    color="pink"
                />

                <StatCard
                    title="Health Score"
                    value={`${stats.healthyReposPercentage}%`}
                    icon={<BarChart3 className="w-4 h-4 text-teal-600" />}
                    description="Repository quality metric"
                    trend={{ value: 3, direction: 'up', label: "this quarter" }}
                    color="teal"
                />
            </div>

            {/* Compact Insights Panel */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Key Metrics
                        </h3>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {((stats.totalStars / stats.totalRepos) / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Avg stars/repo
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {(stats.totalForks / stats.totalRepos).toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Avg forks/repo
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {((stats.activeRepos / stats.totalRepos) * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Activity rate
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

