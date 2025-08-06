'use client'

import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRequireAuth } from '@/hooks/useAuth'
import { Target, MessageSquare, Clock, Zap, Lightbulb, ArrowRight } from "lucide-react"
import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'

export default function DashboardPage() {
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <PageHeader />

        {/* Welcome Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to GitHub Monitor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your centralized hub for tracking GitHub activity and opportunities
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/action-required">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                  <Zap className="w-8 h-8" />
                  <div>
                    <div className="flex items-center gap-2">
                      Action Required
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1">
                      Items that need your immediate attention
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Target className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Assigned</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Mentions</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="w-6 h-6 text-yellow-500 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Stale PRs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quick-wins">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                  <Lightbulb className="w-8 h-8" />
                  <div>
                    <div className="flex items-center gap-2">
                      Quick Wins
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1">
                      Easy tasks to jumpstart your contributions
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Lightbulb className="w-6 h-6 text-yellow-500 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Good First Issues</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Target className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Easy Fixes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Check Action Required</p>
                  <p className="text-sm">Review items assigned to you, mentions, and stale pull requests that need attention.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-sm font-semibold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Explore Quick Wins</p>
                  <p className="text-sm">Discover good first issues and easy fixes to start contributing to open source projects.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}