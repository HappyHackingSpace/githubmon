"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { useFavoritesStore } from "@/stores/favorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, GitPullRequest, Sparkles, ExternalLink, X, Star } from "lucide-react";
import Link from "next/link";

interface OpportunityItem {
  id: string;
  type: "good-first-issue" | "stale-pr" | "new-repo" | "favorite-activity";
  title: string;
  repo: string;
  description: string;
  url: string;
  timestamp: Date;
  language?: string;
  stars?: number;
  priority: "high" | "medium" | "low";
  actionText: string;
}

export function ActivityFeed() {
  const { pinnedRepos, favoriteUsers } = usePreferencesStore();
  const { repoMetrics } = useFavoritesStore();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);

      const items: OpportunityItem[] = [];

      const userLanguages = new Set(
        Object.values(repoMetrics)
          .map((repo) => repo.language)
          .filter((lang): lang is string => lang !== null)
      );

      try {
        const goodIssuesResponse = await fetch("/api/search/good-first-issues?limit=5");
        if (goodIssuesResponse.ok) {
          const goodIssues = await goodIssuesResponse.json();
          goodIssues.slice(0, 3).forEach((issue: { id: number; title: string; repository: string; url: string; language: string; created_at: string; stars: number }) => {
            items.push({
              id: `issue-${issue.id}`,
              type: "good-first-issue",
              title: issue.title,
              repo: issue.repository,
              description: `New Good First Issue in ${issue.repository}`,
              url: issue.url,
              timestamp: new Date(issue.created_at),
              language: issue.language,
              stars: issue.stars,
              priority: userLanguages.has(issue.language) ? "high" : "medium",
              actionText: "View Issue",
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch good first issues:", error);
      }

      try {
        const stalePRsResponse = await fetch("/api/action-required");
        if (stalePRsResponse.ok) {
          const actionData = await stalePRsResponse.json();
          actionData.stale?.slice(0, 3).forEach((pr: { id: string; title: string; repo: string; url: string; daysOld: number; language?: string; stars?: number }) => {
            if (pr.daysOld >= 7) {
              items.push({
                id: `stale-${pr.id}`,
                type: "stale-pr",
                title: pr.title,
                repo: pr.repo,
                description: `PR awaiting review for ${pr.daysOld} days`,
                url: pr.url,
                timestamp: new Date(Date.now() - pr.daysOld * 24 * 60 * 60 * 1000),
                language: pr.language,
                stars: pr.stars,
                priority: pr.daysOld > 14 ? "high" : "medium",
                actionText: "Review Now",
              });
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch stale PRs:", error);
      }

      try {
        if (userLanguages.size > 0) {
          const firstLang = Array.from(userLanguages)[0];
          const newReposResponse = await fetch(`/api/favorites/trending-repos?language=${encodeURIComponent(firstLang)}`);
          if (newReposResponse.ok) {
            const newRepos = await newReposResponse.json();
            newRepos.slice(0, 2).forEach((repo: { id: number; full_name: string; description: string; html_url: string; created_at: string; language: string; stargazers_count: number }) => {
              items.push({
                id: `repo-${repo.id}`,
                type: "new-repo",
                title: repo.full_name,
                repo: repo.full_name,
                description: repo.description || `New ${repo.language} repository`,
                url: repo.html_url,
                timestamp: new Date(repo.created_at),
                language: repo.language,
                stars: repo.stargazers_count,
                priority: "low",
                actionText: "Explore",
              });
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch new repos:", error);
      }
      try {
        if (pinnedRepos.length > 0 || favoriteUsers.length > 0) {
          const favoriteActivityResponse = await fetch("/api/favorites/activity", {
            method: "POST",
            body: JSON.stringify({
              repos: pinnedRepos,
              users: favoriteUsers,
              limit: 5
            })
          });
          if (favoriteActivityResponse.ok) {
            const activities = await favoriteActivityResponse.json();
            activities.forEach((activity: any) => {
              items.push({
                id: `favorite-${activity.id}`,
                type: "favorite-activity",
                title: activity.title,
                repo: activity.repo,
                description: activity.type === "pullRequest" ? `New PR in favorite repo` : `New issue in favorite repo`,
                url: activity.url,
                timestamp: new Date(activity.updatedAt),
                language: activity.language,
                stars: activity.stars,
                priority: "high",
                actionText: "Check it out",
              });
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch favorite activity:", error);
      }

      items.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      setOpportunities(items);
      setLoading(false);
    };

    if (pinnedRepos.length > 0 || favoriteUsers.length > 0 || Object.keys(repoMetrics).length > 0) {
      fetchOpportunities();
    } else {
      setLoading(false);
    }
  }, [pinnedRepos, favoriteUsers, repoMetrics]);

  const getIcon = (type: OpportunityItem["type"]) => {
    switch (type) {
      case "good-first-issue":
        return <Sparkles className="h-4 w-4" />;
      case "stale-pr":
        return <AlertCircle className="h-4 w-4" />;
      case "new-repo":
        return <GitPullRequest className="h-4 w-4" />;
      case "favorite-activity":
        return <Star className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getColor = (type: OpportunityItem["type"]) => {
    switch (type) {
      case "good-first-issue":
        return "text-green-600 dark:text-green-400";
      case "stale-pr":
        return "text-orange-600 dark:text-orange-400";
      case "new-repo":
        return "text-blue-600 dark:text-blue-400";
      case "favorite-activity":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: OpportunityItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const visibleOpportunities = opportunities.filter((opp) => !dismissedIds.has(opp.id));

  if (pinnedRepos.length === 0 && Object.keys(repoMetrics).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actionable Activity Feed
          </CardTitle>
          <CardDescription>Opportunities from your favorites</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add favorites to discover opportunities and track actionable activities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actionable Activity Feed
        </CardTitle>
        <CardDescription>
          Opportunities and actionable items from your network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-sm text-muted-foreground">Finding opportunities...</span>
          </div>
        ) : visibleOpportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No opportunities found.</p>
        ) : (
          <div className="space-y-3">
            {visibleOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow relative"
              >
                <button
                  onClick={() => handleDismiss(opportunity.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  title="Dismiss"
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getColor(opportunity.type)}`}>
                    {getIcon(opportunity.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {opportunity.type.replace(/-/g, " ")}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(opportunity.priority)}`}>
                        {opportunity.priority}
                      </Badge>
                      {opportunity.language && (
                        <Badge variant="secondary" className="text-xs">
                          {opportunity.language}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {opportunity.title}
                    </p>

                    <p className="text-xs text-muted-foreground mb-2">
                      {opportunity.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link href={opportunity.url} target="_blank">
                        <Button size="sm" variant="default" className="h-7 text-xs">
                          {opportunity.actionText}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                      {opportunity.stars && (
                        <span className="text-xs text-muted-foreground">
                          ⭐ {opportunity.stars.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
