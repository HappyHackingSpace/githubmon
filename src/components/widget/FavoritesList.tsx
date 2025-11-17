"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { useFavoritesStore } from "@/stores/favorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Star, GitPullRequest, User, TrendingUp, TrendingDown, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function FavoritesList() {
  const pinnedRepos = usePreferencesStore((state) => state.pinnedRepos);
  const favoriteUsers = usePreferencesStore((state) => state.favoriteUsers);
  const { repoMetrics, userMetrics, loading, error, fetchAllFavorites, isHydrated } = useFavoritesStore();

  const [reposExpanded, setReposExpanded] = useState(true);
  const [usersExpanded, setUsersExpanded] = useState(true);

  useEffect(() => {
    if (isHydrated && (pinnedRepos.length > 0 || favoriteUsers.length > 0)) {
      fetchAllFavorites(pinnedRepos, favoriteUsers);
    }
  }, [pinnedRepos, favoriteUsers, isHydrated, fetchAllFavorites]);

  if (!isHydrated) {
    return (
      <Card id="favorites">
        <CardHeader>
          <CardTitle className="text-lg">Favorites</CardTitle>
          <CardDescription>Your pinned repositories and favorite developers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pinnedRepos.length === 0 && favoriteUsers.length === 0) {
    return (
      <Card id="favorites">
        <CardHeader>
          <CardTitle className="text-lg">Favorites</CardTitle>
          <CardDescription>Your pinned repositories and favorite developers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No favorites yet. Pin repositories or add favorite users to see live metrics here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="favorites">
      <CardHeader>
        <CardTitle className="text-lg">Favorites</CardTitle>
        <CardDescription>Live metrics from your favorites (updated within 24h)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pinnedRepos.length > 0 && (
          <div>
            <button
              onClick={() => setReposExpanded(!reposExpanded)}
              className="flex items-center gap-2 w-full text-left mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {reposExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-semibold">Pinned Repositories ({pinnedRepos.length})</span>
            </button>

            {reposExpanded && (
              <div className="space-y-3">
                {pinnedRepos.map((repoFullName) => {
                  const metrics = repoMetrics[repoFullName];
                  const isLoading = loading.repos[repoFullName];
                  const errorMsg = error.repos[repoFullName];

                  return (
                    <div
                      key={repoFullName}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                          <span className="text-sm text-muted-foreground">Loading metrics...</span>
                        </div>
                      ) : errorMsg ? (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Error: {errorMsg}
                        </div>
                      ) : metrics ? (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                href={metrics.url}
                                target="_blank"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {metrics.fullName}
                              </Link>
                              {metrics.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {metrics.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="font-medium">{metrics.stars.toLocaleString()}</span>
                              {metrics.starChange !== 0 && (
                                <span
                                  className={`flex items-center gap-0.5 ${
                                    metrics.starChange > 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {metrics.starChange > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {Math.abs(metrics.starChange)}
                                </span>
                              )}
                            </div>

                            {metrics.newIssues24h > 0 && (
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <GitPullRequest className="h-3 w-3" />
                                <span>{metrics.newIssues24h} new</span>
                              </div>
                            )}

                            {metrics.language && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Code className="h-3 w-3" />
                                <span>{metrics.language}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Last activity: {new Date(metrics.lastActivity).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No metrics available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {favoriteUsers.length > 0 && (
          <div>
            <button
              onClick={() => setUsersExpanded(!usersExpanded)}
              className="flex items-center gap-2 w-full text-left mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {usersExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-semibold">Favorite Developers ({favoriteUsers.length})</span>
            </button>

            {usersExpanded && (
              <div className="space-y-3">
                {favoriteUsers.map((username) => {
                  const metrics = userMetrics[username];
                  const isLoading = loading.users[username];
                  const errorMsg = error.users[username];

                  return (
                    <div
                      key={username}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                          <span className="text-sm text-muted-foreground">Loading metrics...</span>
                        </div>
                      ) : errorMsg ? (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Error: {errorMsg}
                        </div>
                      ) : metrics ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Image
                              src={metrics.avatarUrl}
                              alt={metrics.username}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div className="flex-1">
                              <Link
                                href={metrics.url}
                                target="_blank"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {metrics.username}
                              </Link>
                              {metrics.bio && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {metrics.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            {metrics.recentActivity > 0 && (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <TrendingUp className="h-3 w-3" />
                                <span>{metrics.recentActivity} events/24h</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{metrics.followers} followers</span>
                            </div>

                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Code className="h-3 w-3" />
                              <span>{metrics.reposCount} repos</span>
                            </div>
                          </div>

                          {metrics.topLanguages.length > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Languages:</span>
                              <div className="flex gap-2">
                                {metrics.topLanguages.map((lang) => (
                                  <span
                                    key={lang}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No metrics available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
