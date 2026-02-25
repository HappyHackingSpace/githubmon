"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePreferencesStore, type FavoriteCategory } from "@/stores/preferences";
import { useFavoritesStore } from "@/stores/favorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Star, GitPullRequest, User, TrendingUp, TrendingDown, Code, Filter, SortAsc, ExternalLink, Copy, GitBranch, BarChart3, Plus, Settings, X, Tag, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export function FavoritesList() {
  const router = useRouter();
  const {
    pinnedRepos,
    favoriteUsers,
    categories,
    repoMetadata,
    userMetadata,
    togglePinnedRepo,
    toggleFavoriteUser,
    addCategory,
    updateCategory,
    deleteCategory,
    setRepoCategory,
    setUserCategory
  } = usePreferencesStore();
  const { repoMetrics, userMetrics, loading, error, fetchAllFavorites, isHydrated } = useFavoritesStore();

  const [reposExpanded, setReposExpanded] = useState(true);
  const [usersExpanded, setUsersExpanded] = useState(true);

  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [repoSort, setRepoSort] = useState<string>("stars");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [userSort, setUserSort] = useState<string>("activity");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [newRepoName, setNewRepoName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [editingCategory, setEditingCategory] = useState<FavoriteCategory | null>(null);
  const [repoToCategory, setRepoToCategory] = useState<string | null>(null);
  const [userToCategory, setUserToCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && (pinnedRepos.length > 0 || favoriteUsers.length > 0)) {
      fetchAllFavorites(pinnedRepos, favoriteUsers);
    }
  }, [pinnedRepos, favoriteUsers, isHydrated, fetchAllFavorites]);

  const handleCopyUrl = (url: string, identifier: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(identifier);
    setTimeout(() => setCopiedUrl(null), 2000);
  };
  const handleAddRepo = () => {
    if (newRepoName.trim() && newRepoName.includes("/")) {
      togglePinnedRepo(newRepoName.trim(), repoToCategory);
      setNewRepoName("");
      setRepoToCategory(null);
      setAddRepoDialogOpen(false);
    }
  };

  const handleAddUser = () => {
    if (newUsername.trim()) {
      toggleFavoriteUser(newUsername.trim(), userToCategory);
      setNewUsername("");
      setUserToCategory(null);
      setAddUserDialogOpen(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName("");
      setNewCategoryColor("#3b82f6");
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      updateCategory(editingCategory.id, newCategoryName.trim(), newCategoryColor);
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryColor("#3b82f6");
    }
  };

  const colorOptions = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Teal", value: "#14b8a6" },
  ];

  const filteredAndSortedRepos = useMemo(() => {
    const filtered = pinnedRepos.filter((repoName) => {
      if (repoFilter === "all") return true;
      const metadata = repoMetadata[repoName];
      return metadata?.categoryId === repoFilter;
    });

    return filtered.sort((a, b) => {
      const metricsA = repoMetrics[a];
      const metricsB = repoMetrics[b];

      if (!metricsA || !metricsB) return 0;

      switch (repoSort) {
        case "stars":
          return metricsB.stars - metricsA.stars;
        case "activity":
          return new Date(metricsB.lastActivity).getTime() - new Date(metricsA.lastActivity).getTime();
        case "name":
          return a.localeCompare(b);
        case "dateAdded":
          return (repoMetadata[b]?.dateAdded || 0) - (repoMetadata[a]?.dateAdded || 0);
        default:
          return 0;
      }
    });
  }, [pinnedRepos, repoFilter, repoSort, repoMetrics, repoMetadata]);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = favoriteUsers.filter((username) => {
      if (userFilter === "all") return true;
      const metadata = userMetadata[username];
      return metadata?.categoryId === userFilter;
    });

    return filtered.sort((a, b) => {
      const metricsA = userMetrics[a];
      const metricsB = userMetrics[b];

      if (!metricsA || !metricsB) return 0;

      switch (userSort) {
        case "activity":
          return metricsB.recentActivity - metricsA.recentActivity;
        case "followers":
          return metricsB.followers - metricsA.followers;
        case "name":
          return a.localeCompare(b);
        case "dateAdded":
          return (userMetadata[b]?.dateAdded || 0) - (userMetadata[a]?.dateAdded || 0);
        default:
          return 0;
      }
    });
  }, [favoriteUsers, userFilter, userSort, userMetrics, userMetadata]);

  if (!isHydrated) {
    return (
      <Card>
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
      <Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Favorites</CardTitle>
            <CardDescription>Live metrics from your favorites (updated within 24h)</CardDescription>
          </div>
          <Dialog open={manageCategoriesOpen} onOpenChange={setManageCategoriesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>Add or edit categories to organize your favorites</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name"
                    value={editingCategory ? "" : newCategoryName}
                    onChange={(e) => !editingCategory && setNewCategoryName(e.target.value)}
                    className="h-8"
                  />
                  <div className="flex gap-1">
                    {colorOptions.slice(0, 4).map(c => (
                      <button
                        key={c.value}
                        onClick={() => setNewCategoryColor(c.value)}
                        className={`w-6 h-6 rounded-full border ${newCategoryColor === c.value ? 'ring-2 ring-indigo-500' : ''}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <Button size="sm" onClick={handleAddCategory} className="h-8">Add</Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteCategory(cat.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pinnedRepos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setReposExpanded(!reposExpanded)}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {reposExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-sm">
                    {filteredAndSortedRepos.length} Repos
                  </span>
                  <Dialog open={addRepoDialogOpen} onOpenChange={setAddRepoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 dark:text-indigo-400">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Repository</DialogTitle>
                        <DialogDescription>
                          Enter the full repository name (owner/repo)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Repository Name</Label>
                          <Input
                            placeholder="e.g., facebook/react"
                            value={newRepoName}
                            onChange={(e) => setNewRepoName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddRepo()}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category (Optional)</Label>
                          <Select value={repoToCategory || "none"} onValueChange={(v) => setRepoToCategory(v === "none" ? null : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No category</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddRepo} className="w-full">
                          Add Repository
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </button>

              {reposExpanded && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <Select value={repoFilter} onValueChange={setRepoFilter}>
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <SortAsc className="h-3 w-3 text-muted-foreground" />
                    <Select value={repoSort} onValueChange={setRepoSort}>
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stars">Most stars</SelectItem>
                        <SelectItem value="activity">Recent activity</SelectItem>
                        <SelectItem value="dateAdded">Recently added</SelectItem>
                        <SelectItem value="name">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {reposExpanded && (
              <div className="space-y-3">
                {filteredAndSortedRepos.map((repoFullName) => {
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
                                  className={`flex items-center gap-0.5 ${metrics.starChange > 0
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

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-muted-foreground">
                              Last activity: {new Date(metrics.lastActivity).toLocaleDateString()}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => router.push(`/search?repo=${encodeURIComponent(metrics.fullName)}`)}
                                title="View repository analysis"
                              >
                                <BarChart3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => window.open(metrics.url, "_blank")}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() =>
                                  handleCopyUrl(
                                    `https://github.com/${metrics.fullName}.git`,
                                    `clone-${metrics.fullName}`
                                  )
                                }
                              >
                                {copiedUrl === `clone-${metrics.fullName}` ? (
                                  <span className="text-xs text-green-600">Copied!</span>
                                ) : (
                                  <GitBranch className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => handleCopyUrl(metrics.url, `url-${metrics.fullName}`)}
                              >
                                {copiedUrl === `url-${metrics.fullName}` ? (
                                  <span className="text-xs text-green-600">Copied!</span>
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => togglePinnedRepo(metrics.fullName)}
                                title="Remove from favorites"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
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
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setUsersExpanded(!usersExpanded)}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {usersExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md text-sm">
                    {filteredAndSortedUsers.length} Users
                  </span>
                  <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 dark:text-emerald-400">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add User</DialogTitle>
                        <DialogDescription>
                          Enter the GitHub username
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input
                            placeholder="e.g., torvalds"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category (Optional)</Label>
                          <Select value={userToCategory || "none"} onValueChange={(v) => setUserToCategory(v === "none" ? null : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No category</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddUser} className="w-full">
                          Add User
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </button>

              {usersExpanded && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <SortAsc className="h-3 w-3 text-muted-foreground" />
                    <Select value={userSort} onValueChange={setUserSort}>
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activity">Most active</SelectItem>
                        <SelectItem value="followers">Most followers</SelectItem>
                        <SelectItem value="dateAdded">Recently added</SelectItem>
                        <SelectItem value="name">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {usersExpanded && (
              <div className="space-y-3">
                {filteredAndSortedUsers.map((username) => {
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

                          <div className="flex items-center gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => router.push(`/search?user=${encodeURIComponent(metrics.username)}`)}
                              title="View user analytics"
                            >
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => window.open(metrics.url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handleCopyUrl(metrics.url, `user-${metrics.username}`)}
                            >
                              {copiedUrl === `user-${metrics.username}` ? (
                                <span className="text-xs text-green-600">Copied!</span>
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => toggleFavoriteUser(metrics.username)}
                              title="Remove from favorites"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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
      </CardContent>
    </Card>
  );
}
