// src/app/quick-wins/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useRequireAuth } from '@/hooks/useAuth'
import { useQuickWins } from '@/components/quick-wins/hooks/useQuickWins'
import { QuickWinsTable } from '@/components/quick-wins/QuickWinsTable'
import { SearchModal } from '@/components/search/SearchModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import RefreshButton from "@/components/Refresh/RefreshButton";

import {
    Lightbulb,
    Wrench,
    Search,
    RefreshCw,
    AlertTriangle,
    Info,
    Github
} from 'lucide-react'
import { useSearchStore } from '@/stores'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function QuickWinsPage() {
    const { isLoading, orgData } = useRequireAuth()
    const { setSearchModalOpen } = useSearchStore()

    const searchParams = useSearchParams()
    const router = useRouter()

    const VALID_TABS = ['good-issues', 'easy-fixes'] as const
    type ValidTab = typeof VALID_TABS[number]


    const tabParam = searchParams.get('tab')
    const currentTab: ValidTab = VALID_TABS.includes(tabParam as ValidTab)
        ? (tabParam as ValidTab)
        : 'good-issues'
    const {
        goodIssues,
        easyFixes,
        loadingGoodIssues,
        loadingEasyFixes,
        goodIssuesError,
        easyFixesError,
        refreshGoodIssues,
        refreshEasyFixes,
        refreshAll,
        totalIssues,
        needsToken,
        hasData
    } = useQuickWins()

    const handleTabChange = (tab: string) => {

        try {
            router.push(`/quick-wins?tab=${tab}`)
        } catch (error) {
            console.error('Failed to navigate to tab:', tab, error)
        }
    }
    const getWelcomeMessage = () => {
        const hour = new Date().getHours()
        const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
        const userName = orgData?.orgName || 'Developer'
        return `${timeOfDay}, ${userName}! `
    }

    // Show loading state during initial load
    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading quick wins...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {getWelcomeMessage()}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Find easy issues to contribute to • Last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setSearchModalOpen(true)}
                            className="px-6 py-2.5 font-medium text-base"
                            size="lg"
                        >
                            <Search className="w-6 h-6 mr-2" />
                            Search
                        </Button>

                        <RefreshButton onRefresh={refreshAll} />

                        <ThemeToggle />
                    </div>
                </div>

                {/* Hero Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Quick Wins
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        Discover easy issues and good first contributions to jumpstart your open source journey
                    </p>
                </div>

                {/* No Token Warning */}
                {needsToken && (
                    <Alert className="border-yellow-200 bg-yellow-50" role="alert" aria-live="polite">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            <strong>GitHub Token Required:</strong> To access more issues and avoid rate limits,
                            please add your GitHub token in the{' '}
                            <Button variant="link" className="h-auto p-0 text-yellow-700 underline" asChild>
                                <a href="/login" aria-label="Go to login page to add GitHub token">login page</a>
                            </Button>
                            . Without a token, results may be limited.
                        </AlertDescription>
                    </Alert>
                )}
                {/* Quick Wins Tabs */}
                <Tabs
                    value={currentTab}
                    onValueChange={(value) => {
                        if (VALID_TABS.includes(value as ValidTab)) {
                            handleTabChange(value)
                        }
                    }}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="good-issues" className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Good First Issues
                            <Badge variant="secondary" className="ml-1">{goodIssues.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="easy-fixes" className="flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Easy Fixes
                            <Badge variant="secondary" className="ml-1">{easyFixes.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="good-issues" className="mt-6">
                        <QuickWinsTable
                            data={goodIssues}
                            loading={loadingGoodIssues}
                            error={goodIssuesError}
                            onRefresh={refreshGoodIssues}
                            title="Good First Issues"
                            description="Well-documented issues perfect for newcomers to open source"
                            emptyMessage="No good first issues found"
                        />
                    </TabsContent>

                    <TabsContent value="easy-fixes" className="mt-6">
                        <QuickWinsTable
                            data={easyFixes}
                            loading={loadingEasyFixes}
                            error={easyFixesError}
                            onRefresh={refreshEasyFixes}
                            title="Easy Fixes"
                            description="Simple bugs and improvements that can be fixed quickly"
                            emptyMessage="No easy fixes found"
                        />
                    </TabsContent>
                </Tabs>


            </div>

            <SearchModal />
        </Layout >
    )
}