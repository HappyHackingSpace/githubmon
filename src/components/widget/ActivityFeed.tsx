"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, GitCommit, GitPullRequest, GitMerge, Star, AlertCircle, User } from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "commit" | "pr" | "issue" | "star" | "fork";
  title: string;
  repo: string;
  user?: string;
  timestamp: Date;
  url: string;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export function ActivityFeed() {
  const pinnedRepos = usePreferencesStore((state) => state.pinnedRepos);
  const favoriteUsers = usePreferencesStore((state) => state.favoriteUsers);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateMockActivities = () => {
      setLoading(true);

      const mockActivities: ActivityItem[] = [];
      const now = Date.now();

      pinnedRepos.slice(0, 3).forEach((repo, idx) => {
        mockActivities.push({
          id: `commit-${idx}`,
          type: "commit",
          title: "Updated dependencies and fixed security vulnerabilities",
          repo,
          timestamp: new Date(now - idx * 3600000),
          url: `https://github.com/${repo}/commits`,
        });

        mockActivities.push({
          id: `pr-${idx}`,
          type: "pr",
          title: "Add new feature: dark mode support",
          repo,
          timestamp: new Date(now - (idx + 1) * 7200000),
          url: `https://github.com/${repo}/pulls`,
        });
      });

      favoriteUsers.slice(0, 2).forEach((username, idx) => {
        mockActivities.push({
          id: `user-activity-${idx}`,
          type: "commit",
          title: "Pushed changes to main branch",
          repo: `${username}/project`,
          user: username,
          timestamp: new Date(now - idx * 5400000),
          url: `https://github.com/${username}`,
        });
      });

      mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(mockActivities.slice(0, 10));
      setLoading(false);
    };

    if (pinnedRepos.length > 0 || favoriteUsers.length > 0) {
      generateMockActivities();
    }
  }, [pinnedRepos, favoriteUsers]);

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "commit":
        return <GitCommit className="h-4 w-4" />;
      case "pr":
        return <GitPullRequest className="h-4 w-4" />;
      case "issue":
        return <AlertCircle className="h-4 w-4" />;
      case "star":
        return <Star className="h-4 w-4" />;
      case "fork":
        return <GitMerge className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "commit":
        return "text-blue-600 dark:text-blue-400";
      case "pr":
        return "text-green-600 dark:text-green-400";
      case "issue":
        return "text-yellow-600 dark:text-yellow-400";
      case "star":
        return "text-purple-600 dark:text-purple-400";
      case "fork":
        return "text-pink-600 dark:text-pink-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (pinnedRepos.length === 0 && favoriteUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>Recent activity from your favorites</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add some favorites to see their recent activity here.
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
          Activity Feed
        </CardTitle>
        <CardDescription>Recent activity from your favorites</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-sm text-muted-foreground">Loading activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity found.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={activity.url}
                target="_blank"
                className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getColor(activity.type)}`}>
                    {getIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {activity.title}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {activity.repo}
                      </span>
                      {activity.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Code({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
