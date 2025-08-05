'use client'

import {  useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useRequireAuth } from '@/hooks/useAuth'
import { Target, MessageSquare, Clock, Zap, Search, ExternalLink } from "lucide-react"
import { useSearchStore, useActionItemsStore } from '@/stores'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import RefreshButton from "@/components/Refresh/RefreshButton";

interface ActionItem {
  id: string | number;
  title: string;
  url?: string;
  repo: string;
  type: string;
  author?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  daysOld?: number;
}

export default function DashboardPage() {
  const { isLoading, orgData, isAuthenticated } = useRequireAuth()
  const { setSearchModalOpen } = useSearchStore()
  const {
    assignedItems,
    mentionItems,
    staleItems,
    loading,
    errors,
    refreshData
  } = useActionItemsStore()

  const searchParams = useSearchParams()
  const router = useRouter()

  const currentTab = searchParams.get('tab') || 'assigned'

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/')
      return
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (orgData?.token) {
      refreshData().catch((error) => {
        console.error('Failed to refresh dashboard data:', error)
      })
    }
  }, [orgData?.token, refreshData])

  const getActionItems = (type: string) => {
    switch (type) {
      case 'assigned': return assignedItems
      case 'mentions': return mentionItems
      case 'stale': return staleItems
      default: return []
    }
  }

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname.includes('github.com');
    } catch {
      return false;
    }
  };

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`)
  }

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
            <RefreshButton onRefresh={refreshData} />
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
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Assigned
              <Badge variant="secondary" className="ml-1">{getActionItems('assigned').length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mentions
              <Badge variant="secondary" className="ml-1">{getActionItems('mentions').length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="stale" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Stale PRs
              <Badge variant="destructive" className="ml-1">{getActionItems('stale').length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Assigned Issues & PRs
                  <Badge variant="outline" className="ml-auto">{getActionItems('assigned').length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.assigned ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          <div>
                            <div className="w-48 h-4 bg-gray-300 rounded mb-1" />
                            <div className="w-24 h-3 bg-gray-200 rounded" />
                          </div>
                        </div>
                        <div className="w-16 h-6 bg-gray-300 rounded" />
                      </div>
                    ))}
                  </div>
                ) : errors.assigned ? (
                  <div className="text-center py-12 text-red-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-red-300" />
                    <p>Failed to load assigned items</p>
                    <p className="text-sm mt-2">{errors.assigned}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => refreshData('assigned')}
                    >
                      Retry
                    </Button>
                  </div>
                ) : getActionItems('assigned').length > 0 ? (
                  <div className="space-y-3">
                    {getActionItems('assigned').map((item: ActionItem) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.priority === 'urgent' ? 'bg-red-600' :
                            item.priority === 'high' ? 'bg-red-500' :
                              item.priority === 'medium' ? 'bg-yellow-500' :
                                'bg-gray-400'
                            }`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{item.title}</h4>
                              {item.url && (
                                <a
                                  href={isValidUrl(item.url) ? item.url : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => !isValidUrl(item.url ?? '') && e.preventDefault()}
                                >
                                  <ExternalLink className="w-3 h-3 text-gray-500 hover:text-blue-500" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{item.repo} • {item.type} • {item.author}</p>
                          </div>
                        </div>
                        <Badge variant={
                          item.priority === 'urgent' ? 'destructive' :
                            item.priority === 'high' ? 'destructive' :
                              item.priority === 'medium' ? 'default' :
                                'secondary'
                        } className="ml-2 flex-shrink-0">
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No assigned items found</p>
                    <p className="text-sm mt-2">Items assigned to you will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Mentions & Reviews
                  <Badge variant="outline" className="ml-auto">{getActionItems('mentions').length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getActionItems('mentions').length > 0 ? (
                  <div className="space-y-3">
                    {getActionItems('mentions').map((item: ActionItem) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-500">{item.repo} • {item.type}</p>
                          </div>
                        </div>
                        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No mentions found</p>
                    <p className="text-sm mt-2">Items where you&apos;re mentioned will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stale" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Stale Pull Requests
                  <Badge variant="outline" className="ml-auto">{getActionItems('stale').length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getActionItems('stale').length > 0 ? (
                  <div className="space-y-3">
                    {getActionItems('stale').map((item: ActionItem) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-500">{item.repo} • {item.daysOld} days old</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600">
                          {item.daysOld}d old
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No stale PRs found</p>
                    <p className="text-sm mt-2">Old pull requests will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}