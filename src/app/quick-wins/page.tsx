'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/useAuth'
import { useQuickWins } from '@/components/quick-wins/hooks/useQuickWins'
import { QuickWinsTable } from '@/components/quick-wins/QuickWinsTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { CacheStatus } from '@/components/common/CacheStatus'
import { RateLimitWarning } from '@/components/common/RateLimitWarning'
import {
    Lightbulb,
    Wrench,

} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'

const VALID_TABS = ['good-issues', 'easy-fixes'] as const
type ValidTab = typeof VALID_TABS[number]

export default function QuickWinsPage() {
    const { isLoading } = useRequireAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [currentTab, setCurrentTab] = useState<ValidTab>('good-issues')

    useEffect(() => {
        const tabParam = searchParams.get('tab')
        if (tabParam && VALID_TABS.includes(tabParam as ValidTab)) {
            setCurrentTab(tabParam as ValidTab)
        }
    }, [searchParams])
    const {
        goodIssues,
        easyFixes,
        loadingGoodIssues,
        loadingEasyFixes,
        goodIssuesError,
        easyFixesError,
        refreshGoodIssues,
        refreshEasyFixes,
     
       
    } = useQuickWins()

    const handleTabChange = (tab: string) => {
        if (VALID_TABS.includes(tab as ValidTab)) {
            setCurrentTab(tab as ValidTab)
            router.push(`/quick-wins?tab=${tab}`)
        }
    }
   

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
                <PageHeader   />
                
                {/* Rate Limit Warning */}
                <RateLimitWarning />
               
                {/* Hero Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-yellow-500" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Quick Wins
                            </h1>
                        </div>
                        <CacheStatus />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        Discover easy issues and good first contributions to jumpstart your open source journey
                    </p>
                </div>

              
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
                            emptyMessage="No easy fixes found"
                        />
                    </TabsContent>
                </Tabs>


            </div>

           
        </Layout >
    )
}