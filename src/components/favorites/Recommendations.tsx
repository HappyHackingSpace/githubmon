"use client";

import { useEffect, useState, useMemo } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { useFavoritesStore } from "@/stores/favorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Star, Code, ExternalLink } from "lucide-react";
import type { TrendingRepo } from "@/types/oss-insight";

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<TrendingRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { togglePinnedRepo, pinnedRepos } = usePreferencesStore();
  const { repoMetrics } = useFavoritesStore();

  const userLanguages = useMemo(() => {
    const langCounts: Record<string, number> = {};

    Object.values(repoMetrics).forEach((repo) => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });

    return Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);
  }, [repoMetrics]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (userLanguages.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const language = userLanguages[0];
        const response = await fetch(`/api/favorites/recommendations?language=${encodeURIComponent(language)}`);

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userLanguages]);

  const handleToggleFavorite = (repoFullName: string) => {
    togglePinnedRepo(repoFullName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-500" />
          AI Matchmaker
        </CardTitle>
        <CardDescription>
          Recommended repos based on your tech stack
          {userLanguages.length > 0 && (
            <span className="block mt-1">
              Your top languages: {userLanguages.join(", ")}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-sm text-muted-foreground">Finding matches...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
        ) : userLanguages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add some favorites to get personalized recommendations
          </p>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations found.</p>
        ) : (
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((repo) => {
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
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
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
                    {repo.language && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Code className="h-3 w-3" />
                        <span>{repo.language}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      size="sm"
                      variant={isFavorited ? "default" : "outline"}
                      className="h-6 px-2 text-xs"
                      onClick={() => handleToggleFavorite(repo.full_name)}
                    >
                      <Star className={`h-3 w-3 mr-1 ${isFavorited ? "fill-current" : ""}`} />
                      {isFavorited ? "Favorited" : "Add"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(repo.html_url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
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
