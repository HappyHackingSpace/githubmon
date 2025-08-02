"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Header } from "@/components/layout/Header";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  SidebarSearch,
  SidebarToggle,
} from "@/components/layout/SidebarSearch";
import { useSearchStore, useSidebarState } from "@/stores";
import { SearchModal } from "@/components/search/SearchModal";
import { githubAPIClient } from "@/lib/api/github-api-client";
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Search,
  User,
  Package,
  Activity,
  Code,
  GitPullRequest,
  AlertCircle,
  Calendar,
  UserPlus,
  BarChart3,
  GitCommit,
  Folder,
} from "lucide-react";
import type { TrendingRepo, TopContributor } from "@/types/oss-insight";
import { AreaChart, BarChart, PieChart, LineChart } from "@/components/charts";
import ChartWrapper from "@/components/charts/ChartWrapper";

interface UserAnalytics {
  profile?: {
    avatar_url: string;
    login: string;
    type: string;
    bio?: string;
    public_repos: number;
    followers: number;
    following: number;
    location?: string;
    company?: string;
    html_url: string;
  };
  overview?: Array<{
    name: string;
    commits: number;
    stars: number;
    repos?: number;
  }>;
  languages?: Array<{
    name: string;
    value: number;
  }>;
  behavior?: Array<{
    day: string;
    commits: number;
    prs: number;
    issues: number;
  }>;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const repoParam = searchParams.get("repo");
  const { isLoading } = useRequireAuth();
  const { setCurrentQuery, setCurrentSearchType, setSearchModalOpen } =
    useSearchStore();
  const { setOpen } = useSidebarState();

  // Refs for scroll sections
  const overviewRef = useRef<HTMLDivElement>(null);
  const behaviorRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const codeReviewRef = useRef<HTMLDivElement>(null);
  const issueRef = useRef<HTMLDivElement>(null);
  const monthlyStatsRef = useRef<HTMLDivElement>(null);
  const contributionActivitiesRef = useRef<HTMLDivElement>(null);

  const [searchResults, setSearchResults] = useState<{
    repos: TrendingRepo[];
    users: TopContributor[];
    loading: boolean;
    error: string | null;
  }>({
    repos: [],
    users: [],
    loading: false,
    error: null,
  });

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null
  );
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  const throttle = useCallback(
    <T extends (...args: any[]) => void>(
      func: T,
      delay: number
    ): ((...args: Parameters<T>) => void) => {
      let timeoutId: NodeJS.Timeout | undefined;
      let lastExecTime = 0;

      return function (this: any, ...args: Parameters<T>) {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
          func.apply(this, args);
          lastExecTime = currentTime;
        } else {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            func.apply(this, args);
            lastExecTime = Date.now();
          }, delay - (currentTime - lastExecTime));
        }
      };
    },
    []
  );

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = throttle(() => {
      const sections = [
        { id: "overview", ref: overviewRef },
        { id: "behavior", ref: behaviorRef },
        { id: "star", ref: starRef },
        { id: "code", ref: codeRef },
        { id: "code-review", ref: codeReviewRef },
        { id: "issue", ref: issueRef },
        { id: "monthly-stats", ref: monthlyStatsRef },
        { id: "contribution-activities", ref: contributionActivitiesRef },
      ];
      const scrollPosition = window.scrollY + 200; // 200px offset
      let currentSection = sections[0].id;

      // En alttaki section'ı bul
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = sections[i].ref.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = element.offsetTop;

          if (scrollPosition >= elementTop) {
            currentSection = sections[i].id;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    }, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [throttle]);

  useEffect(() => {
    if (userParam || repoParam) {
      const query = userParam || repoParam || "";
      const type = userParam ? "users" : "repos";

      setCurrentQuery(query);
      setCurrentSearchType(type);
      performSearch(query, type);
      setHasSearched(true);

      // If searching for a user, load analytics
      if (userParam) {
        loadUserAnalytics(userParam);
      }
    }
  }, [userParam, repoParam, setCurrentQuery, setCurrentSearchType]);
  const performSearch = async (query: string, type: "users" | "repos") => {
    setSearchResults((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (type === "users") {
        const users = await githubAPIClient.searchUsers(query, "all", 20);
        setSearchResults({
          repos: [],
          users: users || [],
          loading: false,
          error: null,
        });
      } else {
        const repos = await githubAPIClient.searchRepositories(
          query,
          "stars",
          20
        );
        setSearchResults({
          repos: repos || [],
          users: [],
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({
        repos: [],
        users: [],
        loading: false,
        error: "Search failed. Please try again.",
      });
    }
  };

  const loadUserAnalytics = async (username: string) => {
    setLoadingAnalytics(true);
    try {
      // User analytics method was removed - no longer available
      console.log("User analytics feature temporarily disabled");
      setUserAnalytics(null);
    } catch (error) {
      console.error("Analytics error:", error);
      // Fallback to null if API fails
      setUserAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Dispatch active section to sidebar
  useEffect(() => {
    const event = new CustomEvent("activeSectionChange", {
      detail: { section: activeSection },
    });
    window.dispatchEvent(event);
  }, [activeSection]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex flex-1">
          <SidebarToggle onClick={() => setOpen(true)} />
          <SidebarSearch />
          <main className="flex-1 lg:ml-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1">
        <SidebarToggle onClick={() => setOpen(true)} />
        <SidebarSearch />

        <main className="flex-1 lg:ml-80 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Show search prompt if no parameters */}
            {!userParam && !repoParam && !hasSearched && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Search GitHub
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use the search functionality to find users or repositories
                  </p>
                </div>

                <Button
                  onClick={() => setSearchModalOpen(true)}
                  className="px-6 py-3"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Open Search
                </Button>
              </div>
            )}

            {/* User Results with Analytics */}
            {userParam &&
              searchResults.users.length > 0 &&
              !searchResults.loading && (
                <div className="space-y-8">
                  {/* User Profile Section */}
                  <div></div>
                  <div className="grid gap-4 mb-8">
                    {userAnalytics?.profile && (
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={userAnalytics.profile.avatar_url}
                              alt={userAnalytics.profile.login}
                              className="w-20 h-20 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h2 className="text-2xl font-semibold">
                                  {userAnalytics.profile.login}
                                </h2>
                                <Badge variant="outline">
                                  {userAnalytics.profile.type}
                                </Badge>
                              </div>
                              {userAnalytics.profile.bio && (
                                <p className="text-gray-600 mb-3">
                                  {userAnalytics.profile.bio}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                  Repos: {userAnalytics.profile.public_repos}
                                </span>
                                <span>
                                  Followers: {userAnalytics.profile.followers}
                                </span>
                                <span>
                                  Following: {userAnalytics.profile.following}
                                </span>
                              </div>
                              {userAnalytics.profile.location && (
                                <p className="text-sm text-gray-500 mt-2">
                                  📍 {userAnalytics.profile.location}
                                </p>
                              )}
                              {userAnalytics.profile.company && (
                                <p className="text-sm text-gray-500 mt-1">
                                  🏢 {userAnalytics.profile.company}
                                </p>
                              )}
                            </div>
                            <Button asChild>
                              <a
                                href={userAnalytics.profile.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Profile
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Fallback to search results if no analytics profile */}
                    {!userAnalytics?.profile &&
                      searchResults.users.slice(0, 1).map((user) => (
                        <Card
                          key={user.login}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <img
                                src={user.avatar_url}
                                alt={user.login}
                                className="w-20 h-20 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h2 className="text-2xl font-semibold">
                                    {user.login}
                                  </h2>
                                  <Badge variant="outline">{user.type}</Badge>
                                </div>
                                {user.bio && (
                                  <p className="text-gray-600 mb-3">
                                    {user.bio}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Repos: {user.repos_count}</span>
                                  <span>Followers: {user.followers_count}</span>
                                </div>
                              </div>
                              <Button asChild>
                                <a
                                  href={user.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Profile
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

            {/* Analytics Sections */}
            {userAnalytics?.overview &&
              userAnalytics?.languages &&
              userAnalytics?.behavior &&
              !loadingAnalytics && (
                <>
                  {/* Overview Section */}
                  <div id="overview" ref={overviewRef} className="scroll-mt-24">
                    <div className="flex items-center mb-6">
                      <Eye className="w-6 h-6 mr-2" />
                      <h2 className="text-2xl font-bold">Overview</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <ChartWrapper
                        title="Activity Overview"
                        loading={false}
                        height={200}
                      >
                        <AreaChart
                          data={userAnalytics.overview}
                          xField="name"
                          yFields={["commits", "stars"]}
                          height={200}
                          stack={true}
                          colors={["#8884d8", "#82ca9d"]}
                        />
                      </ChartWrapper>

                      <ChartWrapper
                        title="Language Distribution"
                        loading={false}
                        height={200}
                      >
                        <BarChart
                          data={userAnalytics.languages}
                          xField="name"
                          yFields={["value"]}
                          height={200}
                          colors={[
                            "#8884d8",
                            "#82ca9d",
                            "#ffc658",
                            "#ff7c7c",
                            "#8dd1e1",
                            "#d084d0",
                            "#ffb347",
                          ]}
                        />
                      </ChartWrapper>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">
                              Quick Stats
                            </h3>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead className="text-right">
                                  Value
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-gray-500" />
                                    Total Repositories
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {userAnalytics.profile?.public_repos || 0}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Total Followers
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {userAnalytics.profile?.followers || 0}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-gray-500" />
                                    Following
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {userAnalytics.profile?.following || 0}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-gray-500" />
                                    Total Stars Earned
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {userAnalytics.overview?.reduce(
                                    (sum: number, item: any) =>
                                      sum + (item.stars || 0),
                                    0
                                  ) || 0}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <GitCommit className="w-4 h-4 text-gray-500" />
                                    Total Commits
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {userAnalytics.overview?.reduce(
                                    (sum: number, item: any) =>
                                      sum + (item.commits || 0),
                                    0
                                  ) || 0}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Behavior Section */}
                    <div
                      id="behavior"
                      ref={behaviorRef}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center mb-6">
                        <Activity className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">
                          Behavior Analysis
                        </h2>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="text-lg font-semibold mb-3">
                              Weekly Activity Pattern
                            </h3>
                            <BarChart
                              data={userAnalytics.behavior}
                              xField="day"
                              yFields={["commits", "prs", "issues"]}
                              height={250}
                              colors={["#8884d8", "#82ca9d", "#ffc658"]}
                            />
                          </CardContent>
                        </Card>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-semibold">
                              Activity Summary
                            </h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="py-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">
                                      Most Active Day
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-semibold">
                                    {/* Most Active Day calculation */}
                                    {userAnalytics.behavior?.length > 0
                                      ? userAnalytics.behavior.reduce(
                                        (max: any, day: any) =>
                                          day.commits + day.prs + day.issues >
                                            max.commits + max.prs + max.issues
                                            ? day
                                            : max
                                      ).day
                                      : "N/A"}
                                  </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="py-3 flex items-center gap-2">
                                    <GitCommit className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">
                                      Total Weekly Commits
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-semibold">
                                    {/* Weekly totals */}
                                    {userAnalytics.behavior?.reduce(
                                      (sum: number, day: any) =>
                                        sum + day.commits,
                                      0
                                    ) || 0}
                                  </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="py-3 flex items-center gap-2">
                                    <GitPullRequest className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">
                                      Total Weekly PRs
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-semibold">
                                    {userAnalytics.behavior?.reduce(
                                      (sum: number, day: any) => sum + day.prs,
                                      0
                                    ) || 0}
                                  </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="py-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">
                                      Total Weekly Issues
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-semibold">
                                    {userAnalytics.behavior?.reduce(
                                      (sum: number, day: any) =>
                                        sum + day.issues,
                                      0
                                    ) || 0}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Star Section */}
                    <div id="star" ref={starRef} className="scroll-mt-24">
                      <div className="flex items-center mb-6">
                        <Star className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">Star Activity</h2>
                      </div>

                      <ChartWrapper
                        title="Stars Over Time"
                        loading={false}
                        height={200}
                      >
                        <LineChart
                          data={userAnalytics.overview}
                          xField="name"
                          yFields={["stars"]}
                          height={200}
                          colors={["#8884d8"]}
                        />
                      </ChartWrapper>
                    </div>
                    {/* Code Section */}
                    <div id="code" ref={codeRef} className="scroll-mt-24">
                      <div className="flex items-center mb-6">
                        <Code className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">
                          Code Contributions
                        </h2>
                      </div>

                      <ChartWrapper
                        title="Commit Activity"
                        loading={false}
                        height={200}
                      >
                        <AreaChart
                          data={userAnalytics.overview}
                          xField="name"
                          yFields={["commits"]}
                          height={200}
                          colors={["#8884d8"]}
                        />
                      </ChartWrapper>
                    </div>

                    {/* Code Review Section */}
                    <div
                      id="code-review"
                      ref={codeReviewRef}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center mb-6">
                        <GitPullRequest className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">Code Review</h2>
                      </div>

                      <ChartWrapper
                        title="Pull Request Activity"
                        loading={false}
                        height={200}
                      >
                        <BarChart
                          data={userAnalytics.behavior}
                          xField="day"
                          yFields={["prs"]}
                          height={200}
                          colors={["#82ca9d"]}
                        />
                      </ChartWrapper>
                    </div>

                    {/* Issue Section */}
                    <div id="issue" ref={issueRef} className="scroll-mt-24">
                      <div className="flex items-center mb-6">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">Issues</h2>
                      </div>

                      <ChartWrapper
                        title="Issue Activity"
                        loading={false}
                        height={200}
                      >
                        <LineChart
                          data={userAnalytics.behavior}
                          xField="day"
                          yFields={["issues"]}
                          height={200}
                          colors={["#ffc658"]}
                        />
                      </ChartWrapper>
                    </div>

                    {/* Monthly Statistics Section */}
                    <div
                      id="monthly-stats"
                      ref={monthlyStatsRef}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center mb-6">
                        <Calendar className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">
                          Monthly Statistics
                        </h2>
                      </div>

                      <ChartWrapper
                        title="Monthly Trends"
                        loading={false}
                        height={250}
                      >
                        <AreaChart
                          data={userAnalytics.overview}
                          xField="name"
                          yFields={["commits", "repos", "stars"]}
                          height={250}
                          stack={true}
                          colors={["#8884d8", "#82ca9d", "#ffc658"]}
                        />
                      </ChartWrapper>
                    </div>

                    {/* Contribution Activities Section */}
                    <div
                      id="contribution-activities"
                      ref={contributionActivitiesRef}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center mb-6">
                        <Activity className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">
                          Contribution Activities
                        </h2>
                      </div>

                      <ChartWrapper
                        title="Overall Contribution Pattern"
                        loading={false}
                        height={250}
                      >
                        <BarChart
                          data={userAnalytics.behavior}
                          xField="day"
                          yFields={["commits", "prs", "issues"]}
                          height={250}
                          colors={["#8884d8", "#82ca9d", "#ffc658"]}
                        />
                      </ChartWrapper>
                    </div>
                  </div>
                </>
              )}

            {/* Loading Analytics */}
            {loadingAnalytics && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            )}

            {/* No Analytics Data */}
            {!loadingAnalytics &&
              userAnalytics &&
              (!userAnalytics.overview ||
                !userAnalytics.languages ||
                !userAnalytics.behavior) && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Limited Analytics Data
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Analytics data for this user is limited or unavailable. This
                    may be due to:
                  </p>
                  <ul className="text-sm text-gray-500 text-left max-w-md mx-auto">
                    <li>• Private repositories or activity</li>
                    <li>• Limited public activity</li>
                    <li>• GitHub API rate limits</li>
                  </ul>
                </div>
              )}

            {/* No User Found */}
            {!loadingAnalytics &&
              !userAnalytics &&
              searchResults.users.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
                  <p className="text-gray-600 mb-4">
                    No user data available for "{userParam}"
                  </p>
                  <Button onClick={() => setSearchModalOpen(true)}>
                    Try Different Search
                  </Button>
                </div>
              )}

            {/* Repository Results */}
            {repoParam &&
              searchResults.repos.length > 0 &&
              !searchResults.loading && (
                <div>
                  <div className="flex items-center mb-6">
                    <Package className="w-6 h-6 mr-2" />
                    <h1 className="text-2xl font-bold">
                      Repositories matching "{repoParam}"
                    </h1>
                    <Badge variant="secondary" className="ml-3">
                      {searchResults.repos.length} results
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {searchResults.repos.map((repo) => (
                      <Card
                        key={repo.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h2 className="text-xl font-semibold text-blue-600">
                                  {repo.full_name}
                                </h2>
                                {repo.language && (
                                  <Badge variant="outline">
                                    {repo.language}
                                  </Badge>
                                )}
                                {repo.archived && (
                                  <Badge variant="secondary">Archived</Badge>
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-gray-600 mb-3">
                                  {repo.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1" />
                                  {repo.stargazers_count.toLocaleString()}
                                </span>
                                <span className="flex items-center">
                                  <GitFork className="w-4 h-4 mr-1" />
                                  {repo.forks_count.toLocaleString()}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {repo.watchers_count.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Button asChild>
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Repo
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            {/* No Results */}
            {(userParam || repoParam) &&
              !searchResults.loading &&
              !searchResults.error &&
              ((userParam && searchResults.users.length === 0) ||
                (repoParam && searchResults.repos.length === 0)) && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    No results found
                  </h2>
                  <p className="text-gray-600 mb-4">
                    No {userParam ? "users" : "repositories"} found for "
                    {userParam || repoParam}"
                  </p>
                  <Button onClick={() => setSearchModalOpen(true)}>
                    Try Different Search
                  </Button>
                </div>
              )}

            {/* Error State */}
            {searchResults.error && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-red-600">
                  Search Error
                </h2>
                <p className="text-gray-600 mb-4">{searchResults.error}</p>
                <Button onClick={() => setSearchModalOpen(true)}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading State */}
            {searchResults.loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <SearchModal />
    </div>
  );
}
