'use client'

import { useEffect, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRequireAuth } from '@/hooks/useAuth'
import { Target, MessageSquare, Clock, Zap, ExternalLink, RefreshCw } from "lucide-react"
import { useActionItemsStore } from '@/stores'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchModal } from '@/components/search/SearchModal'

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

const VALID_TABS = ['assigned', 'mentions', 'stale'] as const
type ValidTab = typeof VALID_TABS[number]

function ActionRequiredContent() {
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

  const tabParam = searchParams?.get('tab')
  const currentTab: ValidTab = VALID_TABS.includes(tabParam as ValidTab)
    ? (tabParam as ValidTab)
    : 'assigned'

  // Memoize refreshData to prevent unnecessary calls
  const memoizedRefreshData = useCallback(() => {
    refreshData().catch((error) => {
      console.error('Failed to refresh action items:', error)
    })
  }, [refreshData])

  useEffect(() => {
    memoizedRefreshData()
  }, [memoizedRefreshData])

  const actionItemsByType = useMemo(() => ({
    assigned: assignedItems,
    mentions: mentionItems,
    stale: staleItems
  }), [assignedItems, mentionItems, staleItems])

  const itemCounts = useMemo(() => ({
    assigned: actionItemsByType.assigned.length,
    mentions: actionItemsByType.mentions.length,
    stale: actionItemsByType.stale.length
  }), [actionItemsByType])

  const getActionItems = useCallback((type: 'assigned' | 'mentions' | 'stale') => {
    return actionItemsByType[type]
  }, [actionItemsByType])

  const isValidUrl = (url?: string): boolean => {
    if (!url) return false
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' && parsed.hostname.includes('github.com')
    } catch {
      return false
    }
  }

  const handleTabChange = (tab: string) => {
    if (VALID_TABS.includes(tab as ValidTab)) {
      router.push(`/action-required?tab=${tab}`)
    }
  }

  const ActionItemsList = ({ 
    type, 
    icon: Icon, 
    title, 
    emptyMessage, 
    emptyDescription,
  }: {
    type: 'assigned' | 'mentions' | 'stale'
    icon: any
    title: string
    emptyMessage: string
    emptyDescription: string
    color?: 'blue' | 'green' | 'yellow' | 'orange'
  }) => {
    const items = getActionItems(type)
    const isLoading = loading[type]
    const error = errors[type]

   

    if (isLoading) {
      return (
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
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <Icon className="w-12 h-12 mx-auto mb-4 text-red-300" />
          <p>Failed to load {title.toLowerCase()}</p>
          <p className="text-sm mt-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refreshData(type)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>{emptyMessage}</p>
          <p className="text-sm mt-2">{emptyDescription}</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((item: ActionItem) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                item.priority === 'urgent' ? 'bg-red-600' :
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
                <p className="text-sm text-gray-500 truncate">
                  {item.repo} • {item.type} 
                  {item.author && ` • ${item.author}`}
                  {type === 'stale' && item.daysOld && ` • ${item.daysOld} days old`}
                </p>
              </div>
            </div>
            <Badge 
              variant={
                type === 'stale' ? 'outline' :
                item.priority === 'urgent' ? 'destructive' :
                item.priority === 'high' ? 'destructive' :
                item.priority === 'medium' ? 'default' :
                'secondary'
              } 
              className={`ml-2 flex-shrink-0 ${type === 'stale' ? 'text-orange-600' : ''}`}
            >
              {type === 'stale' ? `${item.daysOld}d old` : item.priority}
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <PageHeader />

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Action Required
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={memoizedRefreshData}
              disabled={loading.assigned || loading.mentions || loading.stale}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(loading.assigned || loading.mentions || loading.stale) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Items that need your immediate attention across your repositories
          </p>
          
         
        </div>

        {/* Action Required Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={(value: string) => {
            if (VALID_TABS.includes(value as ValidTab)) {
              handleTabChange(value)
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Assigned
              <Badge variant="secondary" className="ml-1">{itemCounts.assigned}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mentions
              <Badge variant="secondary" className="ml-1">{itemCounts.mentions}</Badge>
            </TabsTrigger>
            <TabsTrigger value="stale" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Stale PRs
              <Badge variant="destructive" className="ml-1">{itemCounts.stale}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Assigned Issues & PRs
                  <Badge variant="outline" className="ml-auto">{itemCounts.assigned} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActionItemsList
                  type="assigned"
                  icon={Target}
                  title="Assigned Items"
                  emptyMessage="No assigned items found"
                  emptyDescription="Items assigned to you will appear here"
                  color="blue"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Mentions & Reviews
                  <Badge variant="outline" className="ml-auto">{itemCounts.mentions} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActionItemsList
                  type="mentions"
                  icon={MessageSquare}
                  title="Mentions & Reviews"
                  emptyMessage="No mentions found"
                  emptyDescription="Items where you're mentioned will appear here"
                  color="green"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stale" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Stale Pull Requests
                  <Badge variant="outline" className="ml-auto">{itemCounts.stale} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActionItemsList
                  type="stale"
                  icon={Clock}
                  title="Stale Pull Requests"
                  emptyMessage="No stale PRs found"
                  emptyDescription="Old pull requests will appear here"
                  color="orange"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}

export default function ActionRequiredPage() {
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading action required items...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Suspense fallback={
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <ActionRequiredContent />
      </Suspense>
      <SearchModal />
    </Layout>
  )
}