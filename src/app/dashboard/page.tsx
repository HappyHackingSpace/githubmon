// src/app/dashboard/page.tsx
'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useRequireAuth } from '@/hooks/useAuth'
import { Target, MessageSquare, Clock, Zap, Search } from "lucide-react"
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { SearchModal } from '@/components/search/SearchModal'
import { useSearchStore } from '@/stores'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function DashboardPage() {
  const { isLoading, orgData } = useRequireAuth()
  const { setSearchModalOpen } = useSearchStore()
  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const userName = orgData?.orgName || 'Developer'
    return `${timeOfDay}, ${userName}! `
  }


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
        {/* Header */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getWelcomeMessage()}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Your GitHub analytics dashboard • Last updated: {new Date().toLocaleTimeString()}
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

            <ThemeToggle />

          </div>
        </div>

        

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Action Required
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Items that need your attention
          </p>
        </div>

        {/* Action Request Tabs */}
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Assigned
              <Badge variant="secondary" className="ml-1">0</Badge>
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mentions
              <Badge variant="secondary" className="ml-1">0</Badge>
            </TabsTrigger>
            <TabsTrigger value="stale" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Stale PRs
              <Badge variant="secondary" className="ml-1">0</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Assigned Issues & PRs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No assigned items found</p>
                  <p className="text-sm mt-2">Items assigned to you will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Mentions & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No mentions found</p>
                  <p className="text-sm mt-2">Items where you're mentioned will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stale" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Stale Pull Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No stale PRs found</p>
                  <p className="text-sm mt-2">Old pull requests will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}