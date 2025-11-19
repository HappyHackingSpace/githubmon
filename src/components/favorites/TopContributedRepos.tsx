"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Star, GitPullRequest, Code, ExternalLink } from "lucide-react";
import type { TrendingRepo } from "@/types/oss-insight";

export function TopContributedRepos() {
  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { togglePinnedRepo, pinnedRepos } = usePreferencesStore();

  useEffect(() => {
    const fetchTrendingRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/favorites/trending-repos");
        if (!response.ok) {
          throw new Error("Failed to fetch trending repositories");
        }
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingRepos();
  }, []);

  const handleToggleFavorite = (repoFullName: string) => {
    togglePinnedRepo(repoFullName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Top Contributed Repos
        </CardTitle>
        <CardDescription>Trending repositories in the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-sm text-muted-foreground">Loading trending repos...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
        ) : repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trending repos found.</p>
        ) : (
          <div className="space-y-3">
            {repos.map((repo) => {
              const isFavorited = pinnedRepos.includes(repo.full_name);

              return (
                <div
                  key={repo.full_name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {repo.full_name}
                      </a>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-3 w-3" />
                      <span>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                    {repo.open_issues_count > 0 && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <GitPullRequest className="h-3 w-3" />
                        <span>{repo.open_issues_count} issues</span>
                      </div>
                    )}
                    {repo.language && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Code className="h-3 w-3" />
                        <span>{repo.language}</span>
                      </div>
                    )}
                  </div>

                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      size="sm"
                      variant={isFavorited ? "default" : "outline"}
                      className="h-6 px-2 text-xs"
                      onClick={() => handleToggleFavorite(repo.full_name)}
                    >
                      <Star className={`h-3 w-3 mr-1 ${isFavorited ? "fill-current" : ""}`} />
                      {isFavorited ? "Favorited" : "Favorite"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(repo.html_url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
