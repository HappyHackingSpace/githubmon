"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarState, useAuthStore, useStoreHydration, useActionItemsStore, usePreferencesStore } from "@/stores";
import { useQuickWinsStore } from "@/stores/quickWins";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Clock,
  MessageSquare,
  Star,
  Target,
  Zap,
  Home,
  UserCheck,
  Lightbulb,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  GitBranch,
  Pin,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedLogo } from "./AnimatedLogo";
import { SidebarItem } from "./SidebarItem";
import { SidebarGroup } from "./SidebarGroup";
import { UserProfileMenu } from "./UserProfileMenu";
import { SubMenuFlyout } from "./SubMenuFlyout";

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

  useEffect(() => {
    const isActionRequiredPage = pathname === "/action-required";
    const isQuickWinsPage = pathname === "/quick-wins";

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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          "bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/50 shadow-2xl overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:pointer-events-none",
          sidebarCollapsed ? "lg:w-[76px] w-64" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "flex flex-col h-screen"
        )}
      >
        <div className="flex items-center justify-between px-4 py-6 mb-2 shrink-0">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 shadow-inner">
                  <AnimatedLogo size={28} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100 tracking-tight">
                    GitHubMon
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:flex h-8 w-8 p-0 text-slate-500 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg"
                  title="Collapse sidebar"
                >
                  <div className="flex items-center gap-1">
                    <PanelLeftClose className="h-4 w-4" />
                  </div>
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="lg:hidden text-slate-500 hover:text-slate-100 transition-colors h-8 w-8 flex items-center justify-center p-0 rounded-lg hover:bg-slate-800/50"
                >
                  ✕
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="p-2 rounded-xl bg-primary/20 shadow-inner">
                <AnimatedLogo size={28} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-visible custom-scrollbar">
          <div className="pb-10">
            <nav className="space-y-1 px-2">
              <SidebarGroup
                title="Monitors"
                isCollapsed={sidebarCollapsed}
              />

              <SidebarItem
                icon={Home}
                text="Dashboard"
                href="/dashboard"
                isActive={pathname === "/dashboard"}
                isCollapsed={sidebarCollapsed}
              />

              <div>
                {sidebarCollapsed ? (
                  <SubMenuFlyout
                    icon={Zap}
                    label="Action Required"
                    totalBadge={getActionRequiredTotal}
                    isActive={isActionRequiredTab}
                    items={[
                      {
                        icon: UserCheck,
                        label: "Assigned",
                        href: "/action-required?tab=assigned",
                        badge: getBadgeContent("assigned"),
                        isActive: pathname === "/action-required" && currentTab === "assigned",
                      },
                      {
                        icon: MessageSquare,
                        label: "Mentions",
                        href: "/action-required?tab=mentions",
                        badge: getBadgeContent("mentions"),
                        isActive: pathname === "/action-required" && currentTab === "mentions",
                      },
                      {
                        icon: Clock,
                        label: "Stale PRs",
                        href: "/action-required?tab=stale",
                        badge: getBadgeContent("stale"),
                        isActive: pathname === "/action-required" && currentTab === "stale",
                      },
                    ]}
                  />
                ) : (
                  <>
                    <SidebarItem
                      icon={Zap}
                      text="Action Required"
                      isActive={isActionRequiredTab}
                      isCollapsed={false}
                      onClick={() =>
                        handleActionRequiredToggle(!actionRequiredOpen)
                      }
                      badge={
                        <Badge
                          variant="outline"
                          className="text-[10px] min-w-[1.25rem] h-4 bg-primary/10 text-primary border-primary/20"
                        >
                          {getActionRequiredTotal}
                        </Badge>
                      }
                      chevron={
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 text-slate-500 transition-transform duration-300",
                            actionRequiredOpen ? "rotate-90" : ""
                          )}
                        />
                      }
                    />

                    {actionRequiredOpen && (
                      <div className="ml-5 pl-4 space-y-1 mt-1 border-l border-slate-800/50">
                        <Link
                          href="/action-required?tab=assigned"
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium",
                            pathname === "/action-required" && currentTab === "assigned"
                              ? "text-primary bg-primary/10"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          )}
                        >
                          <UserCheck className={cn("w-4 h-4 shrink-0 transition-transform", currentTab !== "assigned" && "group-hover:scale-110")} />
                          <span className="flex-1">Assigned</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 bg-muted/20 border-muted-foreground/10",
                              pathname === "/action-required" && currentTab === "assigned" && "bg-primary text-primary-foreground border-transparent"
                            )}
                          >
                            {getBadgeContent("assigned")}
                          </Badge>
                        </Link>
                        <Link
                          href="/action-required?tab=mentions"
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium",
                            pathname === "/action-required" && currentTab === "mentions"
                              ? "text-primary bg-primary/10"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          )}
                        >
                          <MessageSquare className={cn("w-4 h-4 shrink-0 transition-transform", currentTab !== "mentions" && "group-hover:scale-110")} />
                          <span className="flex-1">Mentions</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 bg-muted/20 border-muted-foreground/10",
                              pathname === "/action-required" && currentTab === "mentions" && "bg-primary text-primary-foreground border-transparent"
                            )}
                          >
                            {getBadgeContent("mentions")}
                          </Badge>
                        </Link>
                        <Link
                          href="/action-required?tab=stale"
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium",
                            pathname === "/action-required" && currentTab === "stale"
                              ? "text-primary bg-primary/10"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          )}
                        >
                          <Clock className={cn("w-4 h-4 shrink-0 transition-transform", currentTab !== "stale" && "group-hover:scale-110")} />
                          <span className="flex-1">Stale PRs</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 bg-muted/20 border-muted-foreground/10",
                              pathname === "/action-required" && currentTab === "stale" && "bg-primary text-primary-foreground border-transparent"
                            )}
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
                  <SubMenuFlyout
                    icon={Target}
                    label="Quick Wins"
                    totalBadge={getQuickWinsTotal}
                    isActive={isQuickWinsTab}
                    items={[
                      {
                        icon: Lightbulb,
                        label: "Good First Issues",
                        href: "/quick-wins?tab=good-issues",
                        badge: getBadgeContent("goodFirstIssues"),
                        isActive: pathname === "/quick-wins" && currentTab === "good-issues",
                      },
                      {
                        icon: Wrench,
                        label: "Easy Fixes",
                        href: "/quick-wins?tab=easy-fixes",
                        badge: getBadgeContent("easyFixes"),
                        isActive: pathname === "/quick-wins" && currentTab === "easy-fixes",
                      },
                    ]}
                  />
                ) : (
                  <>
                    <SidebarItem
                      icon={Target}
                      text="Quick Wins"
                      isActive={isQuickWinsTab}
                      isCollapsed={false}
                      onClick={() => handleQuickWinsToggle(!quickWinsOpen)}
                      badge={
                        <Badge
                          variant="outline"
                          className="text-[10px] min-w-[1.25rem] h-4 bg-primary/10 text-primary border-primary/20"
                        >
                          {getQuickWinsTotal}
                        </Badge>
                      }
                      chevron={
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 text-slate-500 transition-transform duration-300",
                            quickWinsOpen ? "rotate-90" : ""
                          )}
                        />
                      }
                    />

                    {quickWinsOpen && (
                      <div className="ml-5 pl-4 space-y-1 mt-1 border-l border-slate-800/50">
                        <Link
                          href="/quick-wins?tab=good-issues"
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium",
                            pathname === "/quick-wins" && currentTab === "good-issues"
                              ? "text-primary bg-primary/10"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          )}
                        >
                          <Lightbulb className={cn("w-4 h-4 shrink-0 transition-transform", currentTab !== "good-issues" && "group-hover:scale-110")} />
                          <span className="flex-1">Good First Issues</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 bg-muted/20 border-muted-foreground/10",
                              pathname === "/quick-wins" && currentTab === "good-issues" && "bg-primary text-primary-foreground border-transparent"
                            )}
                          >
                            {getBadgeContent("goodFirstIssues")}
                          </Badge>
                        </Link>
                        <Link
                          href="/quick-wins?tab=easy-fixes"
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium",
                            pathname === "/quick-wins" && currentTab === "easy-fixes"
                              ? "text-primary bg-primary/10"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          )}
                        >
                          <Wrench className={cn("w-4 h-4 shrink-0 transition-transform", currentTab !== "easy-fixes" && "group-hover:scale-110")} />
                          <span className="flex-1">Easy Fixes</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 bg-muted/20 border-muted-foreground/10",
                              pathname === "/quick-wins" && currentTab === "easy-fixes" && "bg-primary text-primary-foreground border-transparent"
                            )}
                          >
                            {getBadgeContent("easyFixes")}
                          </Badge>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              <SidebarItem
                icon={Star}
                text="Favorites"
                href="/favorites"
                isActive={pathname === "/favorites"}
                isCollapsed={sidebarCollapsed}
              />

              {hasHydrated && pinnedRepos.length > 0 && (
                <>
                  <SidebarGroup
                    icon={Pin}
                    title="Pinned"
                    isCollapsed={sidebarCollapsed}
                  />
                  <div className="space-y-1">
                    {pinnedRepos.slice(0, 5).map((repo) => {
                      if (sidebarCollapsed) {
                        return (
                          <TooltipProvider key={repo} delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="px-2">
                                  <a
                                    href={`https://github.com/${repo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-all duration-200 text-slate-400 hover:text-slate-100 group"
                                    aria-label={repo}
                                  >
                                    <GitBranch className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-slate-100">
                                <p>{repo}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }
                      return (
                        <div key={repo} className="px-2">
                          <a
                            href={`https://github.com/${repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-slate-800/50 transition-all duration-200 font-medium text-slate-400 hover:text-slate-100"
                          >
                            <GitBranch className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                            <span className="truncate flex-1">{repo}</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800/50 bg-slate-900/40">
          {hasHydrated && isConnected && orgData && (
            <UserProfileMenu
              username={orgData.username}
              orgName={orgData.orgName}
              isCollapsed={sidebarCollapsed}
              onLogout={logout}
            />
          )}
        </div>
      </aside>
    </>
  );
}
