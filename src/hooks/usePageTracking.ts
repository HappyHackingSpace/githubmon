"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useNavigationStore } from "@/stores"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/action-required": "Action Required",
  "/quick-wins": "Quick Wins",
  "/settings": "Settings",
  "/search": "Search",
  "/": "Home",
}

export function usePageTracking() {
  const pathname = usePathname()
  const addToHistory = useNavigationStore((state) => state.addToHistory)

  useEffect(() => {
    const title = PAGE_TITLES[pathname] || pathname

    if (pathname && title) {
      addToHistory(pathname, title)
    }
  }, [pathname, addToHistory])
}
