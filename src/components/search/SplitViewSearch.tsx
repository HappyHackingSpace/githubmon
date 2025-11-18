"use client"

import { useState, useCallback } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Users,
  Package,
  ChevronRight,
} from "lucide-react"
import type { TrendingRepo, TopContributor } from "@/types/oss-insight"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SplitViewSearchProps {
  repos: TrendingRepo[]
  users: TopContributor[]
  onUserSelect?: (username: string) => void
  onRepoSelect?: (repoFullName: string) => void
}

export function SplitViewSearch({
  repos,
  users,
  onUserSelect,
  onRepoSelect,
}: SplitViewSearchProps) {
  const [selectedRepo, setSelectedRepo] = useState<TrendingRepo | null>(
    repos[0] || null
  )
  const [selectedUser, setSelectedUser] = useState<TopContributor | null>(
    users[0] || null
  )
  const [activeTab, setActiveTab] = useState<"repos" | "users">(
    repos.length > 0 ? "repos" : "users"
  )

  const handleRepoClick = useCallback((repo: TrendingRepo) => {
    setSelectedRepo(repo)
    setActiveTab("repos")
  }, [])

  const handleUserClick = useCallback((user: TopContributor) => {
    setSelectedUser(user)
    setActiveTab("users")
  }, [])

  const handleNavigateToRepo = useCallback(
    (repoFullName: string) => {
      onRepoSelect?.(repoFullName)
    },
    [onRepoSelect]
  )

  const handleNavigateToUser = useCallback(
    (username: string) => {
      onUserSelect?.(username)
    },
    [onUserSelect]
  )

  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel defaultSize={30} minSize={20} maxSize={40}>
        <div className="h-full overflow-y-auto border-r bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-4 border-b bg-white dark:bg-gray-950 sticky top-0 z-10">
            <div className="flex gap-2">
              {repos.length > 0 && (
                <Button
                  variant={activeTab === "repos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("repos")}
                  className="flex-1"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Repos ({repos.length})
                </Button>
              )}
              {users.length > 0 && (
                <Button
                  variant={activeTab === "users" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("users")}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users ({users.length})
                </Button>
              )}
            </div>
          </div>

          <div className="p-2">
            {activeTab === "repos" && (
              <div className="space-y-2">
                {repos.map((repo) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedRepo?.id === repo.id &&
                          "ring-2 ring-blue-500 dark:ring-blue-400"
                      )}
                      onClick={() => handleRepoClick(repo)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Image
                            src={repo.owner.avatar_url}
                            alt={repo.owner.login}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate text-blue-600 dark:text-blue-400">
                              {repo.full_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                {repo.stargazers_count.toLocaleString()}
                              </span>
                              {repo.language && (
                                <Badge variant="outline" className="text-xs">
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-2">
                {users.map((user) => (
                  <motion.div
                    key={user.login}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedUser?.login === user.login &&
                          "ring-2 ring-blue-500 dark:ring-blue-400"
                      )}
                      onClick={() => handleUserClick(user)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Image
                            src={user.avatar_url}
                            alt={user.login}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate text-blue-600 dark:text-blue-400">
                              {user.login}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <Badge variant="outline" className="text-xs">
                                {user.type}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="w-2 hover:bg-blue-500 transition-colors" />

      <Panel defaultSize={70} minSize={60}>
        <div className="h-full overflow-y-auto">
          {activeTab === "repos" && selectedRepo && (
            <motion.div
              key={selectedRepo.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <Image
                        src={selectedRepo.owner.avatar_url}
                        alt={selectedRepo.owner.login}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {selectedRepo.full_name}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedRepo.language && (
                            <Badge variant="outline">
                              {selectedRepo.language}
                            </Badge>
                          )}
                          {selectedRepo.archived && (
                            <Badge variant="secondary">Archived</Badge>
                          )}
                        </div>
                        {selectedRepo.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {selectedRepo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            {selectedRepo.stargazers_count.toLocaleString()}{" "}
                            stars
                          </span>
                          <span className="flex items-center">
                            <GitFork className="w-4 h-4 mr-2" />
                            {selectedRepo.forks_count.toLocaleString()} forks
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            {selectedRepo.watchers_count.toLocaleString()}{" "}
                            watchers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleNavigateToRepo(selectedRepo.full_name)
                        }
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(selectedRepo.html_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open on GitHub
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && selectedUser && (
            <motion.div
              key={selectedUser.login}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <Image
                        src={selectedUser.avatar_url}
                        alt={selectedUser.login}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {selectedUser.login}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{selectedUser.type}</Badge>
                        </div>
                        {selectedUser.bio && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {selectedUser.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            {selectedUser.repos_count} repositories
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {selectedUser.followers_count.toLocaleString()}{" "}
                            followers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleNavigateToUser(selectedUser.login)}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(selectedUser.html_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open on GitHub
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {!selectedRepo && !selectedUser && (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select an item to view details</p>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </PanelGroup>
  )
}
