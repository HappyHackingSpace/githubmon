import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  AlertCircle,
  Star,
  Loader2,
  GitBranch,
  Users,
  Maximize2,
} from "lucide-react";
import { githubAPIClient } from "@/lib/api/github-api-client";
import {
  useSearchStore,
  usePreferencesStore,
  useNotifications,
} from "@/stores";
import type { TrendingRepo, TopContributor } from "@/types/oss-insight";
import { SplitViewSearch } from "./SplitViewSearch";

import { useRouter } from "next/navigation";

export function SearchModal() {
  const router = useRouter();
  const {
    isSearchModalOpen,
    currentQuery,
    currentSearchType,
    currentResults,
    searchHistory,
    setSearchModalOpen,
    setCurrentQuery,
    setCurrentSearchType,
    setSearchResults,
    addToHistory,
  } = useSearchStore();

  const { defaultSearchType } = usePreferencesStore();
  const { add: addNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<"list" | "split">("split");

  useEffect(() => {
    if (isSearchModalOpen && !currentQuery) {
      setCurrentSearchType(defaultSearchType);
    }
  }, [
    isSearchModalOpen,
    defaultSearchType,
    currentQuery,
    setCurrentSearchType,
  ]);

  const performSearch = useCallback(
    async (searchQuery: string, type: "all" | "repos" | "users") => {
      if (!searchQuery.trim()) {
        setSearchResults({ repos: [], users: [], loading: false, error: null });
        return;
      }

      setSearchResults({
        repos: currentResults.repos,
        users: currentResults.users,
        loading: true,
        error: null,
      });

      try {
        let repos: TrendingRepo[] = [];
        let users: TopContributor[] = [];

        if (type === "all") {
          repos = await githubAPIClient.searchRepositories(
            searchQuery,
            "stars",
            5
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
          users = await githubAPIClient.searchUsers(searchQuery, "all", 5);
        } else if (type === "repos") {
          repos = await githubAPIClient.searchRepositories(
            searchQuery,
            "stars",
            10
          );
        } else if (type === "users") {
          users = await githubAPIClient.searchUsers(searchQuery, "all", 10);
        }

        setSearchResults({
          repos: repos || [],
          users: users || [],
          loading: false,
          error: null,
        });

        if ((repos && repos.length > 0) || (users && users.length > 0)) {
          addToHistory(searchQuery, type);
        }
      } catch {
        const errorMessage = "An error occurred during search";

        setSearchResults({
          repos: currentResults.repos,
          users: currentResults.users,
          loading: false,
          error: errorMessage,
        });

        addNotification({
          type: "error",
          title: "Search Error",
          message: errorMessage,
        });
      }
    },
    [
      currentResults.repos,
      currentResults.users,
      setSearchResults,
      addToHistory,
      addNotification,
    ]
  );

  const [debouncedSearch] = useState(() => {
    let timeout: NodeJS.Timeout;
    return (query: string, type: "all" | "repos" | "users") => {
      clearTimeout(timeout);
      timeout = setTimeout(() => performSearch(query, type), 800);
    };
  });

  useEffect(() => {
    debouncedSearch(currentQuery, currentSearchType);
  }, [currentQuery, currentSearchType, debouncedSearch]);

  useEffect(() => {
    if (!isSearchModalOpen) {
      setCurrentQuery("");
      setSearchResults({ repos: [], users: [], loading: false, error: null });
    }
  }, [isSearchModalOpen, setCurrentQuery, setSearchResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === "Escape" && isSearchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  const handleUserClick = (username: string) => {
    setCurrentQuery(username);
    setCurrentSearchType("users");
    setSearchModalOpen(false);
    router.push(`/search?user=${username}`);
  };

  const handleRepoClick = (repoName: string) => {
    setCurrentQuery(repoName);
    setCurrentSearchType("repos");
    setSearchModalOpen(false);
    router.push(`/search?repo=${repoName}`);
  };

  const hasResults =
    currentResults.repos.length > 0 || currentResults.users.length > 0;

  return (
    <Dialog open={isSearchModalOpen} onOpenChange={setSearchModalOpen}>
      <DialogContent className={`${hasResults && viewMode === "split" ? "max-w-7xl h-[85vh]" : "max-w-4xl max-h-[80vh]"} p-0 ${viewMode === "split" && hasResults ? "" : "overflow-y-auto"}`}>
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search on GitHub</span>
              </DialogTitle>
              <DialogDescription>
                Search for repositories, users, and organizations on GitHub.
              </DialogDescription>
            </div>
            {hasResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "split" ? "list" : "split")}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                {viewMode === "split" ? "List View" : "Split View"}
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Search Input & Filters */}
        <div className="p-6 pb-4 space-y-4">
          <Input
            placeholder="Search for repository, user or organization..."
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            className="text-lg h-14 w-full overflow-x-auto px-4 font-medium"
            autoFocus
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filter:</span>
              {(["all", "repos", "users"] as const).map((type) => (
                <Button
                  key={type}
                  variant={currentSearchType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSearchType(type)}
                >
                  {type === "all"
                    ? "All"
                    : type === "repos"
                    ? "Repositories"
                    : "Users"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === "split" && hasResults ? (
          <div className="flex-1 h-[calc(85vh-200px)]">
            <SplitViewSearch
              repos={currentResults.repos}
              users={currentResults.users}
              onRepoSelect={handleRepoClick}
              onUserSelect={handleUserClick}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-6">
          {currentResults.loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
          )}

          {currentResults.error && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-2 text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                {currentResults.error}
              </div>
              <Button
                variant="outline"
                onClick={() => debouncedSearch(currentQuery, currentSearchType)}
              >
                Try Again
              </Button>
            </div>
          )}

          {!currentResults.loading &&
            !currentResults.error &&
            currentQuery &&
            !hasResults && (
              <div className="text-center py-8 text-gray-500">
                <div className="flex items-center justify-center mb-2">
                  <Search className="w-12 h-12 text-gray-300" />
                </div>
                <div>No results found for &ldquo;{currentQuery}&rdquo;</div>
                <div className="text-sm mt-2">Try different keywords</div>
              </div>
            )}

          {/* Repositories */}
          {currentResults.repos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                Repositories ({currentResults.repos.length})
              </h3>
              <Card className="max-h-80 overflow-y-auto">
                <CardContent className="p-0 divide-y">
                  {currentResults.repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 group cursor-pointer"
                      onClick={() => handleRepoClick(repo.full_name)}
                    >
                      <Image
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-indigo-600 group-hover:text-indigo-800 truncate">
                          {repo.full_name}
                        </span>
                        {repo.language && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {repo.language}
                          </Badge>
                        )}
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Star className="w-3 h-3 mr-1" />
                          <span className="truncate">
                            {repo.stargazers_count.toLocaleString()}
                          </span>
                        </div>
                        {repo.description && (
                          <span className="block text-xs text-gray-400 mt-0.5 truncate">
                            {repo.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users */}
          {currentResults.users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Users ({currentResults.users.length})
              </h3>
              <Card className="max-h-80 overflow-y-auto">
                <CardContent className="p-0 divide-y">
                  {currentResults.users.map((user) => (
                    <div
                      key={user.login}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 group cursor-pointer"
                      onClick={() => handleUserClick(user.login)}
                    >
                      <Image
                        src={user.avatar_url}
                        alt={user.login}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-indigo-600 group-hover:text-indigo-800 truncate">
                          {user.login}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {user.type}
                        </Badge>
                        {user.bio && (
                          <span className="block text-xs text-gray-500 mt-0.5 truncate">
                            {user.bio}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State with Search History */}
          {!currentQuery && (
            <div className="text-center py-12 text-gray-500">
              <div className="flex items-center justify-center mb-4">
                <Search className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium mb-2">Search on GitHub</h3>
              <p className="text-sm mb-6">
                You can search for repository, user or organization
              </p>
              {searchHistory.length > 0 && (
                <div className="text-left max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Recent Searches
                  </h4>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCurrentQuery(item.query)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{item.query}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Footer Tips */}
        <div className="border-t px-6 py-3 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl</kbd>
              <kbd className="px-1 py-0.5 bg-white border rounded ml-1">K</kbd>
              <span className="ml-2">Search</span>
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-white border rounded">Esc</kbd>
              <span className="ml-2">Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
