"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Link as LinkIcon,
  ExternalLink,
  Package,
  AlertCircle,
  Users,
  Code,
  GitFork,
  HelpCircle,
  TrendingUp,
  Folders,
} from "lucide-react";
import { githubAPIClient } from "@/lib/api/github-api-client";
import type { OrganizationSearchResult } from "@/types/search";

interface OrgResultLayoutProps {
  result: OrganizationSearchResult;
}

export function OrgResultLayout({ result }: OrgResultLayoutProps) {
  const [topProjects, setTopProjects] = useState<Array<{
    name: string;
    fullName: string;
    stars: number;
    language: string | null;
    openIssues: number;
    description: string | null;
  }>>([]);
  const [helpWantedIssues, setHelpWantedIssues] = useState<Array<{
    id: number;
    title: string;
    repo: string;
    url: string;
    labels: string[];
    createdAt: string;
  }>>([]);
  const [orgStats, setOrgStats] = useState<{
    totalStars: number;
    totalForks: number;
    totalOpenIssues: number;
    languageDistribution: Array<{ language: string; count: number; stars: number }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgData() {
      setIsLoading(true);
      try {
        const [repos, helpWanted, stats] = await Promise.all([
          githubAPIClient.getOrganizationRepos(result.login, 10),
          githubAPIClient.getOrganizationHelpWantedIssues(result.login, 20),
          githubAPIClient.getOrganizationStats(result.login),
        ]);

        setTopProjects(
          repos.map((repo) => ({
            name: repo.name,
            fullName: repo.full_name,
            stars: repo.stargazers_count,
            language: repo.language,
            openIssues: repo.open_issues_count,
            description: repo.description,
          }))
        );

        setHelpWantedIssues(helpWanted);
        setOrgStats(stats);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrgData();
  }, [result.login]);

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-shadow border-2 border-green-100 dark:border-green-900">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4 flex-1">
              <Image
                src={result.avatarUrl}
                alt={result.login}
                width={80}
                height={80}
                className="rounded-lg ring-4 ring-green-100 dark:ring-green-900"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {result.name}
                  </h1>
                  <Badge variant="secondary" className="text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    Organization
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
              <Button asChild>
                <a
                  href={result.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Organization
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
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Stars</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                      {isLoading ? "..." : orgStats?.totalStars.toLocaleString()}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Forks</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {isLoading ? "..." : orgStats?.totalForks.toLocaleString()}
                    </p>
                  </div>
                  <GitFork className="w-8 h-8 text-purple-500" />
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
          </div>

          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-red-600" />
              Top Needs - Help Wanted
              {helpWantedIssues.length > 0 && (
                <Badge variant="destructive" className="ml-3">
                  {helpWantedIssues.length} issues
                </Badge>
              )}
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p>Loading help wanted issues...</p>
              </div>
            ) : helpWantedIssues.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {helpWantedIssues.slice(0, 10).map((issue) => (
                  <Card
                    key={issue.id}
                    className="hover:shadow-md transition-shadow border-l-4 border-l-red-400"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {issue.repo}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base mb-2 line-clamp-2">
                            {issue.title}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {issue.labels.map((label) => (
                              <Badge key={label} variant="secondary" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="ml-4 shrink-0"
                        >
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-6 text-center text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No help wanted issues found</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Folders className="w-5 h-5 mr-2 text-blue-600" />
              Project Clusters by Language
            </h2>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p className="text-sm">Analyzing projects...</p>
              </div>
            ) : orgStats && orgStats.languageDistribution.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orgStats.languageDistribution.map((lang) => (
                  <Card key={lang.language} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Code className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{lang.language}</h3>
                        </div>
                        <Badge variant="secondary">{lang.count} repos</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>{lang.stars.toLocaleString()} stars</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No language data available</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Top Projects
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p>Loading top projects...</p>
              </div>
            ) : topProjects.length > 0 ? (
              <div className="space-y-3">
                {topProjects.map((project) => (
                  <Card key={project.fullName} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-1">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center flex-wrap gap-4 text-sm">
                            {project.language && (
                              <Badge variant="outline">{project.language}</Badge>
                            )}
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Star className="w-4 h-4 mr-1 text-yellow-500" />
                              {project.stars.toLocaleString()}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                              {project.openIssues} open issues
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="ml-4 shrink-0"
                        >
                          <a
                            href={`https://github.com/${project.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No projects found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
