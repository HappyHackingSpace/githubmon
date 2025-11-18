"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart3, Bell, CheckCircle2, TrendingUp, GitPullRequest, Clock } from "lucide-react"

interface BentoItemProps {
  className?: string
  title: string
  description: string
  icon: React.ReactNode
  children?: React.ReactNode
}

function BentoItem({ className, title, description, icon, children }: BentoItemProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden group transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.02]",
        "bg-background/80 backdrop-blur-md border-border/20",
        "before:absolute before:inset-0 before:rounded-lg before:p-[1px]",
        "before:bg-gradient-to-r before:from-indigo-500/50 before:via-purple-500/50 before:to-pink-500/50",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        "before:-z-10",
        className
      )}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </Card>
  )
}

export function BentoGrid() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to monitor and analyze your GitHub projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
          <BentoItem
            className="md:col-span-2 lg:row-span-2"
            title="GitHub Analytics"
            description="Comprehensive insights into your repositories with real-time data visualization"
            icon={<BarChart3 className="w-6 h-6 text-indigo-500" />}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                <span className="text-sm font-medium">Active Repositories</span>
                <span className="text-2xl font-bold text-indigo-500">142</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <span className="text-sm font-medium">Total Contributors</span>
                <span className="text-2xl font-bold text-purple-500">89</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-500/5 to-indigo-500/5">
                <span className="text-sm font-medium">Monthly Commits</span>
                <span className="text-2xl font-bold text-pink-500">1.2K</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last month</span>
              </div>
            </div>
          </BentoItem>

          <BentoItem
            className="lg:row-span-1"
            title="Action Required"
            description="Stay on top of issues that need your attention"
            icon={<Bell className="w-6 h-6 text-orange-500" />}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-muted-foreground">3 Critical Issues</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">12 Pending Reviews</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GitPullRequest className="w-4 h-4 text-blue-500" />
                <span className="text-muted-foreground">8 Stale PRs</span>
              </div>
            </div>
          </BentoItem>

          <BentoItem
            className="lg:row-span-1"
            title="Quick Wins"
            description="Find easy-to-tackle issues and good first contributions"
            icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
          >
            <div className="space-y-3">
              <div className="p-2 rounded border border-border/50 hover:border-green-500/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500">good first issue</span>
                </div>
                <p className="text-xs text-muted-foreground">Fix typo in README</p>
              </div>
              <div className="p-2 rounded border border-border/50 hover:border-blue-500/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500">documentation</span>
                </div>
                <p className="text-xs text-muted-foreground">Update API docs</p>
              </div>
            </div>
          </BentoItem>

          <BentoItem
            className="md:col-span-2 lg:col-span-1"
            title="Real-time Monitoring"
            description="Track repository activity as it happens"
            icon={<Clock className="w-6 h-6 text-blue-500" />}
          >
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>john.doe pushed to main - 2 mins ago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>jane.smith opened PR #127 - 15 mins ago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>bot merged PR #125 - 1 hour ago</span>
              </div>
            </div>
          </BentoItem>
        </div>
      </div>
    </section>
  )
}
