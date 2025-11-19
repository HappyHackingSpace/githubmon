"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  useSidebarState,
  useAuthStore,
  useStoreHydration,
  useActionItemsStore,
  usePreferencesStore,
} from "@/stores";
import { useQuickWinsStore } from "@/stores/quickWins";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  ChevronRight,
  Clock,
  LogOut,
  MessageSquare,
  Star,
  Target,
  Zap,
  Home,
  UserCheck,
  Lightbulb,
  Wrench,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,

  GitBranch,
  Pin,
  Settings,
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
export function Sidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isOpen, setOpen } = useSidebarState();

  const hasHydrated = useStoreHydration();
  const { sidebarCollapsed, setSidebarCollapsed } = usePreferencesStore();

  const { isConnected, logout, orgData } = useAuthStore();

  const { getCountByType, loading } = useActionItemsStore();
  const { pinnedRepos } = usePreferencesStore();

  const {
    goodIssues,
    easyFixes,
    loading: quickWinsLoading,
  } = useQuickWinsStore();

  const [actionRequiredOpen, setActionRequiredOpen] = useState(false);
  const [quickWinsOpen, setQuickWinsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Set accordion state based on current pathname
  useEffect(() => {
    const isActionRequiredPage = pathname === "/action-required";
    const isQuickWinsPage = pathname === "/quick-wins";

    // Only open accordions for current page, don't close others
    if (isActionRequiredPage) {
      setActionRequiredOpen(true);
    }
    if (isQuickWinsPage) {
      setQuickWinsOpen(true);
    }

    if (
      pathname === "/dashboard" ||
      pathname === "/settings" ||
      pathname === "/favorites" ||
      pathname === "/search"
    ) {
      setActionRequiredOpen(false);
      setQuickWinsOpen(false);
    }
  }, [pathname]);

  // Accordion toggle handlers
  const handleActionRequiredToggle = (open: boolean) => {
    if (!open && pathname === "/action-required") {
      return;
    }
    setActionRequiredOpen(open);
  };

  const handleQuickWinsToggle = (open: boolean) => {
    if (!open && pathname === "/quick-wins") {
      return;
    }
    setQuickWinsOpen(open);
  };

  const currentTab = searchParams?.get("tab") || "assigned";

  const getBadgeCount = useMemo(() => {
    return (
      type: "assigned" | "mentions" | "stale" | "goodFirstIssues" | "easyFixes"
    ) => {
      if (!hasHydrated) return 0;

      if (type === "goodFirstIssues") return goodIssues.length;
      if (type === "easyFixes") return easyFixes.length;
      return getCountByType(type);
    };
  }, [hasHydrated, goodIssues.length, easyFixes.length, getCountByType]);

  const getActionRequiredTotal = useMemo(() => {
    if (!hasHydrated) return 0;
    return (
      getBadgeCount("assigned") +
      getBadgeCount("mentions") +
      getBadgeCount("stale")
    );
  }, [hasHydrated, getBadgeCount]);

  const getQuickWinsTotal = useMemo(() => {
    if (!hasHydrated) return 0;
    return getBadgeCount("goodFirstIssues") + getBadgeCount("easyFixes");
  }, [hasHydrated, getBadgeCount]);

  const getBadgeContent = (
    type: "assigned" | "mentions" | "stale" | "goodFirstIssues" | "easyFixes"
  ) => {
    if (!hasHydrated) return 0;

    if (type === "goodFirstIssues" || type === "easyFixes") {
      if (quickWinsLoading.goodIssues || quickWinsLoading.easyFixes)
        return "...";
    } else {
      if (loading[type]) return "...";
    }
    return getBadgeCount(type) || 0;
  };

  const isQuickWinsTab = pathname === "/quick-wins";
  const isActionRequiredTab = pathname === "/action-required";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
        fixed top-0 left-0 bg-sidebar border-r border-sidebar-border z-50 transform transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? "lg:w-16 w-64" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        flex flex-col

        h-screen
      `}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!sidebarCollapsed ? (
            <>
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">
                  GitHubMon
                </h2>
                <p className="text-xs text-muted-foreground">OSS Analytics</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="lg:hidden text-muted-foreground hover:text-sidebar-foreground transition-colors"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-lg font-bold text-sidebar-foreground">G</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Navigation Menu */}
          <div className="p-3">
            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg transition-colors
                  ${
                    pathname === "/dashboard"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                aria-label="Dashboard"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                {!sidebarCollapsed && <span>Dashboard</span>}
                {sidebarCollapsed && <span className="sr-only">Dashboard</span>}
              </Link>

              <div>
                {sidebarCollapsed ? (
                  <Link
                    href="/action-required"
                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors
                      ${
                        isActionRequiredTab
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`}
                    aria-label="Action Required"
                  >
                    <Zap className="w-5 h-5" aria-hidden="true" />
                    <span className="sr-only">Action Required</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        handleActionRequiredToggle(!actionRequiredOpen)
                      }
                      className={`
                        flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors cursor-pointer text-left
                        ${
                          isActionRequiredTab
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        <span>Action Required</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="text-xs min-w-[1.25rem] h-5 bg-muted/30 border-muted-foreground/20"
                        >
                          {getActionRequiredTotal}
                        </Badge>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            actionRequiredOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {actionRequiredOpen && (
                  <div className="pl-8 space-y-1 mt-1">
                    <Link
                      href="/action-required?tab=assigned"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${
                          pathname === "/action-required" &&
                          currentTab === "assigned"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      Assigned
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                      >
                        {getBadgeContent("assigned")}
                      </Badge>
                    </Link>
                    <Link
                      href="/action-required?tab=mentions"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${
                          pathname === "/action-required" &&
                          currentTab === "mentions"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mentions
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                      >
                        {getBadgeContent("mentions")}
                      </Badge>
                    </Link>
                    <Link
                      href="/action-required?tab=stale"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${
                          pathname === "/action-required" &&
                          currentTab === "stale"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <Clock className="w-4 h-4" />
                      Stale PRs
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                      >
                        {getBadgeContent("stale")}
                      </Badge>
                    </Link>
                  </div>
                    )}
                  </>
                )}
              </div>

              <div>
                {sidebarCollapsed ? (
                  <Link
                    href="/quick-wins"
                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors
                      ${
                        isQuickWinsTab
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`}
                    aria-label="Quick Wins"
                  >
                    <Target className="w-5 h-5" aria-hidden="true" />
                    <span className="sr-only">Quick Wins</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleQuickWinsToggle(!quickWinsOpen)}
                      className={`
                        flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors cursor-pointer text-left
                        ${
                          isQuickWinsTab
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5" />
                        <span>Quick Wins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="text-xs min-w-[1.25rem] h-5 bg-muted/30 border-muted-foreground/20"
                        >
                          {getQuickWinsTotal}
                        </Badge>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            quickWinsOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {quickWinsOpen && (
                  <div className="pl-8 space-y-1 mt-1">
                    <Link
                      href="/quick-wins?tab=good-issues"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${
                          pathname === "/quick-wins" &&
                          currentTab === "good-issues"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span className="font-medium">Good First Issues</span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                      >
                        {getBadgeContent("goodFirstIssues")}
                      </Badge>
                    </Link>
                    <Link
                      href="/quick-wins?tab=easy-fixes"
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors
                        ${
                          pathname === "/quick-wins" &&
                          currentTab === "easy-fixes"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <Wrench className="w-4 h-4" />
                      <span className="font-medium">Easy Fixes</span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs bg-muted/30 border-muted-foreground/20"
                      >
                        {getBadgeContent("easyFixes")}
                      </Badge>
                    </Link>
                  </div>
                    )}
                  </>
                )}
              </div>

              <Link
                href="/settings"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg transition-colors
                  ${
                    pathname.startsWith("/settings")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                aria-label="Settings"
              >
                <Wrench className="w-5 h-5" aria-hidden="true" />
                {!sidebarCollapsed && <span>Settings</span>}
                {sidebarCollapsed && <span className="sr-only">Settings</span>}
              </Link>

              <Link
                href="/favorites"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg transition-colors
                  ${
                    pathname === "/favorites"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                aria-label="Favorites"
              >
                <Star className="w-5 h-5" aria-hidden="true" />
                {!sidebarCollapsed && <span>Favorites</span>}
                {sidebarCollapsed && <span className="sr-only">Favorites</span>}
              </Link>
            

              {/* Pinned Repositories */}
              {hasHydrated && pinnedRepos.length > 0 && (
                <div className="mt-6">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Pin className="w-3 h-3" />
                    Pinned Repos
                  </div>
                  <div className="space-y-1">
                    {pinnedRepos.slice(0, 5).map((repo) => (
                      <a
                        key={repo}
                        href={`https://github.com/${repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-sidebar-accent/50 transition-colors"
                      >
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{repo}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border flex-shrink-0 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full ${sidebarCollapsed ? "justify-center px-2" : "justify-start"} text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hidden lg:flex`}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Expand sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </Button>


        </div>
        {/* Footer - Modern User Profile Bar */}
        {hasHydrated && isConnected && orgData && (
          <div className="p-3 border-t border-sidebar-border flex-shrink-0 space-y-2">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {orgData.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {orgData.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {orgData.orgName || "GitHub User"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings" className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
