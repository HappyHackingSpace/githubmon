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
import { QuickTaskCommand } from "./QuickTaskCommand"
import { menuItems } from "@/config/menu"
import { Button } from "@/components/ui/button"
import {
  Search,
  Settings,
  Moon,
  Sun,
  LogOut,
  Monitor,
  Clock,
  GitBranch,
  Star,
  Users,
  Loader2,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { githubAPIClient } from "@/lib/api/github-api-client"

export function CommandPalette() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  const isCommandPaletteOpen = useNavigationStore((state) => state.isCommandPaletteOpen)
  const setCommandPaletteOpen = useNavigationStore((state) => state.setCommandPaletteOpen)
  const isQuickTaskOpen = useNavigationStore((state) => state.isQuickTaskOpen)
  const setQuickTaskOpen = useNavigationStore((state) => state.setQuickTaskOpen)
  const recentPages = useNavigationStore((state) => state.recentPages)

  const {
    isSearchModalOpen,
    setSearchModalOpen,
    recentSearches,
    isUnifiedSearchLoading,
    unifiedResults,
    setUnifiedSearchLoading,
    setUnifiedResults
  } = useSearchStore()

  const [inputValue, setInputValue] = React.useState("")

  const {
    theme,
    setTheme,
    pinnedRepos,
    favoriteUsers,
    togglePinnedRepo,
    toggleFavoriteUser
  } = usePreferencesStore()

  const isConnected = useAuthStore((state) => state.isConnected)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const down = (e: KeyboardEvent) => {
      // General Command Palette (Ctrl+K)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setQuickTaskOpen(false)
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }

      // Quick Task (Alt+N)
      if (e.key.toLowerCase() === "n" && e.altKey) {
        e.preventDefault()
        setQuickTaskOpen(true)
        setCommandPaletteOpen(true)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [mounted, isCommandPaletteOpen, setCommandPaletteOpen])

  React.useEffect(() => {
    if (!inputValue.trim() || !isCommandPaletteOpen) {
      setUnifiedResults({ repos: [], users: [] })
      setUnifiedSearchLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setUnifiedSearchLoading(true)
      try {
        const [repos, users] = await Promise.all([
          githubAPIClient.searchRepositories(inputValue, "stars", 5),
          githubAPIClient.searchUsers(inputValue, "all", 5)
        ])
        setUnifiedResults({ repos, users })
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setUnifiedSearchLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [inputValue, isCommandPaletteOpen, setUnifiedResults, setUnifiedSearchLoading])

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
      label: "Search GitHub",
      icon: Search,
      onSelect: () => {
        // Just focus the input if already open
        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
        if (input) input.focus();
      },
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
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={(open) => {
      setCommandPaletteOpen(open)
      if (!open) setQuickTaskOpen(false)
    }}>
      {isQuickTaskOpen ? (
        <QuickTaskCommand onClose={() => setCommandPaletteOpen(false)} />
      ) : (
        <>
          <CommandInput
            placeholder="Type a command or search GitHub..."
            value={inputValue}
            onValueChange={setInputValue}
          />
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

            {isUnifiedSearchLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching GitHub...</span>
              </div>
            )}

            {unifiedResults.repos.length > 0 && (
              <CommandGroup heading="GitHub Repositories">
                {unifiedResults.repos.map((repo) => (
                  <CommandItem
                    key={repo.id}
                    onSelect={() => handleSelect(() => router.push(`/search?repo=${repo.full_name}`))}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <GitBranch className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{repo.full_name}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 ml-2"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        togglePinnedRepo(repo.full_name)
                      }}
                    >
                      <Star className={`h-3 w-3 ${pinnedRepos.includes(repo.full_name) ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {unifiedResults.users.length > 0 && (
              <CommandGroup heading="GitHub Users">
                {unifiedResults.users.map((user) => (
                  <CommandItem
                    key={user.login}
                    onSelect={() => handleSelect(() => router.push(`/search?user=${user.login}`))}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <Users className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{user.login}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 ml-2"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        toggleFavoriteUser(user.login)
                      }}
                    >
                      <Star className={`h-3 w-3 ${favoriteUsers.includes(user.login) ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

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
        </>
      )}
    </CommandDialog>
  )
}
