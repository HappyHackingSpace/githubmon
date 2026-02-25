"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useNavigationStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "action-required": "Action Required",
  "quick-wins": "Quick Wins",
  settings: "Settings",
  favorites: "Favorites",
  search: "Search",
};

export function AppHeader() {
  const pathname = usePathname();
  const { setCommandPaletteOpen } = useNavigationStore();

  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment !== "");

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = routeLabels[segment] || segment;
    return { path, label, isLast: index === pathSegments.length - 1 };
  });

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ path: "/dashboard", label: "Dashboard", isLast: true });
  }

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
              )}
              {crumb.isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <Button
          variant="outline"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-80 flex justify-between items-center px-4"
        >
          <div className="flex items-center text-muted-foreground">
            <Search className="w-4 h-4 mr-2" />
            <span>Search GitHub...</span>
          </div>
          <Badge variant="secondary" className="ml-2 text-xs">
            <kbd className="text-xs">⌘</kbd>
            <kbd className="text-xs ml-0.5">K</kbd>
          </Badge>
        </Button>
      </div>
    </header>
  );
}
