"use client";

import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useNavigationStore } from "@/stores";
import { FavoritesList } from "@/components/widget/FavoritesList";
import { ActivityFeed } from "@/components/widget/ActivityFeed";
import { TopContributedRepos } from "@/components/favorites/TopContributedRepos";
import { Recommendations } from "@/components/favorites/Recommendations";
import { Button } from "@/components/ui/button";
import { Settings, Star, Search } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { isLoading } = useRequireAuth();
  const { setCommandPaletteOpen } = useNavigationStore();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              Favorites
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your favorite repositories and developers with live metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 text-muted-foreground bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-dashed"
            >
              <Search className="h-4 w-4" />
              <span>Search for new favorites...</span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-[65%]">
            <ActivityFeed />
          </div>
          <div className="lg:w-[35%] space-y-6">
            <FavoritesList />
            <Recommendations />
            <TopContributedRepos />
          </div>
        </div>
      </div>
    </Layout>
  );
}
