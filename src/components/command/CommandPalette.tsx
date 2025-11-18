"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useNavigationStore, useSearchStore, usePreferencesStore, useAuthStore } from "@/stores"
import { menuItems } from "@/config/menu"
import {
  Search,
  Settings,
  Moon,
  Sun,
  LogOut,
  Monitor,
  Clock,
  GitBranch,
} from "lucide-react"
import { signOut } from "next-auth/react"

export function CommandPalette() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  const isCommandPaletteOpen = useNavigationStore((state) => state.isCommandPaletteOpen)
  const setCommandPaletteOpen = useNavigationStore((state) => state.setCommandPaletteOpen)
  const recentPages = useNavigationStore((state) => state.recentPages)

  const setSearchModalOpen = useSearchStore((state) => state.setSearchModalOpen)
  const recentSearches = useSearchStore((state) => state.recentSearches)

  const theme = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const pinnedRepos = usePreferencesStore((state) => state.pinnedRepos)

  const isConnected = useAuthStore((state) => state.isConnected)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [mounted, isCommandPaletteOpen, setCommandPaletteOpen])

  const handleSelect = React.useCallback((callback: () => void) => {
    setCommandPaletteOpen(false)
    callback()
  }, [setCommandPaletteOpen])

  const navigationItems = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      icon: menuItems.dashboard.icon,
      onSelect: () => router.push("/dashboard"),
    },
    {
      id: "action-required",
      label: "Go to Action Required",
      icon: menuItems.actionRequired.icon,
      onSelect: () => router.push("/action-required"),
    },
    {
      id: "quick-wins",
      label: "Go to Quick Wins",
      icon: menuItems.quickWins.icon,
      onSelect: () => router.push("/quick-wins"),
    },
    {
      id: "settings",
      label: "Go to Settings",
      icon: Settings,
      onSelect: () => router.push("/settings"),
    },
  ]

  const actionItems = [
    {
      id: "search",
      label: "Search Repositories & Users",
      icon: Search,
      onSelect: () => setSearchModalOpen(true),
    },
    {
      id: "theme-light",
      label: "Switch to Light Theme",
      icon: Sun,
      onSelect: () => setTheme("light"),
      condition: theme !== "light",
    },
    {
      id: "theme-dark",
      label: "Switch to Dark Theme",
      icon: Moon,
      onSelect: () => setTheme("dark"),
      condition: theme !== "dark",
    },
    {
      id: "theme-system",
      label: "Switch to System Theme",
      icon: Monitor,
      onSelect: () => setTheme("system"),
      condition: theme !== "system",
    },
    {
      id: "logout",
      label: "Log Out",
      icon: LogOut,
      onSelect: () => signOut({ callbackUrl: "/login" }),
      condition: isConnected,
    },
  ].filter((item) => item.condition !== false)

  if (!mounted) {
    return null
  }

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {recentPages.length > 0 && (
          <>
            <CommandGroup heading="Recent Pages">
              {recentPages.map((page) => (
                <CommandItem
                  key={page.path}
                  onSelect={() => handleSelect(() => router.push(page.path))}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{page.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(item.onSelect)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(item.onSelect)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {pinnedRepos.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pinned Repositories">
              {pinnedRepos.slice(0, 5).map((repo) => (
                <CommandItem
                  key={repo}
                  onSelect={() => handleSelect(() => window.open(`https://github.com/${repo}`, "_blank"))}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  <span>{repo}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {recentSearches.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Searches">
              {recentSearches.slice(0, 5).map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => handleSelect(() => {
                    setSearchModalOpen(true)
                  })}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
