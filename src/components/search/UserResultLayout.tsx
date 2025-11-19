"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Building,
  Link as LinkIcon,
  ExternalLink,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Users,
  UserPlus,
  Code,
  TrendingUp,
  Award,
} from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import type { UserSearchResult } from "@/types/search";

interface UserResultLayoutProps {
  result: UserSearchResult;
}

export function UserResultLayout({ result }: UserResultLayoutProps) {
  const { favoriteUsers, toggleFavoriteUser } = usePreferencesStore();
  const [topRepos, setTopRepos] = useState<Array<{
    name: string;
    stars: number;
    language: string | null;
    description: string | null;
  }>>([]);
  const [contributionStats, setContributionStats] = useState({
    commits: 0,
    prs: 0,
    issues: 0,
    score: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      try {
        const reposResponse = await fetch(
          `https://api.github.com/users/${result.login}/repos?sort=stars&per_page=5`
        );
        const reposData = await reposResponse.json();

        if (Array.isArray(reposData)) {
          setTopRepos(
            reposData.map((repo: {
              name: string;
              stargazers_count: number;
              language: string | null;
              description: string | null;
            }) => ({
              name: repo.name,
              stars: repo.stargazers_count,
              language: repo.language,
              description: repo.description,
            }))
          );

          const totalStars = reposData.reduce(
            (sum: number, repo: { stargazers_count: number }) => sum + repo.stargazers_count,
            0
          );

          const estimatedCommits = reposData.length * 50;
          const estimatedPRs = reposData.length * 10;
          const estimatedIssues = reposData.length * 5;

          const score = calculateOpenSourceScore(
            estimatedCommits,
            estimatedPRs,
            estimatedIssues,
            totalStars,
            result.followers
          );

          setContributionStats({
            commits: estimatedCommits,
            prs: estimatedPRs,
            issues: estimatedIssues,
            score,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [result.login, result.followers]);

  function calculateOpenSourceScore(
    commits: number,
    prs: number,
    issues: number,
    stars: number,
    followers: number
  ): number {
    const commitScore = commits * 0.5;
    const prScore = prs * 2;
    const issueScore = issues * 1;
    const starScore = stars * 0.3;
    const followerScore = followers * 0.2;

    const total = commitScore + prScore + issueScore + starScore + followerScore;

    return Math.min(100, Math.round(total / 10));
  }

  function getContributorLevel(score: number): string {
    if (score >= 90) return "Elite";
    if (score >= 75) return "Expert";
    if (score >= 60) return "Advanced";
    if (score >= 40) return "Intermediate";
    return "Beginner";
  }

  const contributorLevel = getContributorLevel(contributionStats.score);

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-shadow border-2 border-purple-100 dark:border-purple-900">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4 flex-1">
              <Image
                src={result.avatarUrl}
                alt={result.login}
                width={80}
                height={80}
                className="rounded-full ring-4 ring-purple-100 dark:ring-purple-900"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {result.name}
                  </h1>
                  <Badge
                    variant={
                      contributorLevel === "Elite" || contributorLevel === "Expert"
                        ? "default"
                        : "secondary"
                    }
                    className="text-sm"
                  >
                    <Award className="w-4 h-4 mr-1" />
                    {contributorLevel}
                  </Badge>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                  @{result.login}
                </p>
                {result.bio && (
                  <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
                    {result.bio}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {result.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{result.location}</span>
                    </div>
                  )}
                  {result.company && (
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{result.company}</span>
                    </div>
                  )}
                  {result.blog && (
                    <a
                      href={result.blog.startsWith("http") ? result.blog : `https://${result.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant={
                  favoriteUsers.includes(result.login) ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleFavoriteUser(result.login)}
              >
                <Star
                  className={`w-4 h-4 mr-2 ${
                    favoriteUsers.includes(result.login) ? "fill-current" : ""
                  }`}
                />
                {favoriteUsers.includes(result.login) ? "Favorited" : "Favorite"}
              </Button>
              <Button asChild>
                <a
                  href={result.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Repositories</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {result.publicRepos}
                    </p>
                  </div>
                  <Code className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {result.followers.toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {result.following.toLocaleString()}
                    </p>
                  </div>
                  <UserPlus className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">OS Score</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {isLoading ? "..." : `${contributionStats.score}/100`}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              Skills & Languages
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {result.languages && result.languages.length > 0 ? (
                result.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-base px-3 py-1">
                    {lang}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No language data available</p>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <GitCommit className="w-5 h-5 mr-2 text-green-600" />
              Contribution Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                      Est. Commits
                    </h3>
                    <GitCommit className="w-5 h-5 text-blue-600" />
                  </div>
                  {isLoading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                      {contributionStats.commits.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                      Est. Pull Requests
                    </h3>
                    <GitPullRequest className="w-5 h-5 text-purple-600" />
                  </div>
                  {isLoading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                      {contributionStats.prs.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                      Est. Issues
                    </h3>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  {isLoading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                      {contributionStats.issues.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {topRepos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Top Repositories
                </h2>
                <div className="space-y-3">
                  {topRepos.map((repo) => (
                    <Card key={repo.name} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-1">
                              {repo.name}
                            </h3>
                            {repo.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm">
                              {repo.language && (
                                <Badge variant="outline">{repo.language}</Badge>
                              )}
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Star className="w-4 h-4 mr-1" />
                                {repo.stars.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
