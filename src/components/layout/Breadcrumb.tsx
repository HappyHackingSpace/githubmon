"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "action-required": "Action Required",
  "quick-wins": "Quick Wins",
  settings: "Settings",
  search: "Search",
  assigned: "Assigned",
  mentions: "Mentions",
  stale: "Stale PRs",
  "good-issues": "Good First Issues",
  "easy-fixes": "Easy Fixes",
}

export function Breadcrumb() {
  const pathname = usePathname()

  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length === 0) {
    return null
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`
    const label = PATH_LABELS[segment] || segment
    const isLast = index === pathSegments.length - 1

    return {
      label,
      path,
      isLast,
    }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {crumb.isLast ? (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.path}
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
