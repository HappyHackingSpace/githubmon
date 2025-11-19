"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  GitFork,
  AlertCircle,
  GitPullRequest,
  Code,
  ExternalLink,
  Activity,
  Clock,
  TrendingUp,
  Package,
} from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import type { RepositorySearchResult } from "@/types/search";

interface RepoResultLayoutProps {
  result: RepositorySearchResult;
}

export function RepoResultLayout({ result }: RepoResultLayoutProps) {
  const { pinnedRepos, togglePinnedRepo } = usePreferencesStore();
  const [goodFirstIssues, setGoodFirstIssues] = useState<number>(0);
  const [stalePRs, setStalePRs] = useState<number>(0);
  const [contributionScore, setContributionScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRepoMetrics() {
      setIsLoading(true);
      try {
        const goodFirstIssuesQuery = `repo:${result.fullName} label:"good first issue" state:open`;
        const goodFirstResponse = await fetch(
          `https://api.github.com/search/issues?q=${encodeURIComponent(goodFirstIssuesQuery)}&per_page=1`
        );
        const goodFirstData = await goodFirstResponse.json();
        const goodFirstCount = goodFirstData.total_count || 0;
        setGoodFirstIssues(goodFirstCount);

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const dateString = oneMonthAgo.toISOString().split("T")[0];

        const stalePRsQuery = `repo:${result.fullName} type:pr state:open updated:<${dateString}`;
        const stalePRsResponse = await fetch(
          `https://api.github.com/search/issues?q=${encodeURIComponent(stalePRsQuery)}&per_page=1`
        );
        const stalePRsData = await stalePRsResponse.json();
        const stalePRsCount = stalePRsData.total_count || 0;
        setStalePRs(stalePRsCount);

        const contributorsResponse = await fetch(
          `https://api.github.com/repos/${result.fullName}/contributors?per_page=1`
        );
        const contributorsCount = contributorsResponse.headers.get("Link")
          ? parseInt(
              contributorsResponse.headers
                .get("Link")
                ?.match(/page=(\d+)>; rel="last"/)?.[1] || "0"
            )
          : 1;

        const score = calculateContributionScore(
          goodFirstCount,
          stalePRsCount,
          contributorsCount,
          result.openIssues
        );
        setContributionScore(score);
      } catch (error) {
        console.error("Error fetching repo metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepoMetrics();
  }, [result.fullName, result.openIssues]);

  function calculateContributionScore(
    goodFirst: number,
    stale: number,
    contributors: number,
    openIssues: number
  ): number {
    const base = (goodFirst * 2 + stale) * 10;
    const maintainerActivity = contributors > 0 ? contributors : 1;
    const issueRatio = openIssues > 0 ? openIssues / 100 : 0.1;

    return Math.min(100, Math.round(base / maintainerActivity + issueRatio));
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(result.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const activityStatus = daysSinceUpdate < 7 ? "active" : daysSinceUpdate < 30 ? "moderate" : "inactive";

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-shadow border-2 border-blue-100 dark:border-blue-900">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4 flex-1">
              <Image
                src={result.owner.avatarUrl}
                alt={result.owner.login}
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 truncate">
                    {result.fullName}
                  </h1>
                  {result.archived && (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </div>
                {result.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                    {result.description}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-4 text-sm">
                  {result.language && (
                    <div className="flex items-center space-x-1">
                      <Code className="w-4 h-4 text-blue-500" />
                      <Badge variant="outline">{result.language}</Badge>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Updated {daysSinceUpdate}d ago</span>
                    <Badge
                      variant={
                        activityStatus === "active"
                          ? "default"
                          : activityStatus === "moderate"
                          ? "secondary"
                          : "outline"
                      }
                      className="ml-1"
                    >
                      {activityStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant={
                  pinnedRepos.includes(result.fullName) ? "default" : "outline"
                }
                size="sm"
                onClick={() => togglePinnedRepo(result.fullName)}
              >
                <Star
                  className={`w-4 h-4 mr-2 ${
                    pinnedRepos.includes(result.fullName) ? "fill-current" : ""
                  }`}
                />
                {pinnedRepos.includes(result.fullName) ? "Pinned" : "Pin"}
              </Button>
              <Button asChild>
                <a
                  href={result.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Repo
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stars</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                      {result.stars.toLocaleString()}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Forks</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {result.forks.toLocaleString()}
                    </p>
                  </div>
                  <GitFork className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Open Issues</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {result.openIssues.toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Watchers</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {result.watchers.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Contribution Opportunities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-800 dark:text-green-300">
                      Good First Issues
                    </h3>
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  {isLoading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {goodFirstIssues}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Perfect for new contributors
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                      Stale PRs
                    </h3>
                    <GitPullRequest className="w-5 h-5 text-orange-600" />
                  </div>
                  {isLoading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                      {stalePRs}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Needs review or attention
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                      Contribution Score
                    </h3>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  {isLoading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                      {contributionScore}/100
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based on activity & needs
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {result.topics && result.topics.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
