"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Calendar, MessageCircle, Tag, User, Play, Plus, XCircle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserHoverCard } from "@/components/ui/user-hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useKanbanStore, useActionItemsStore, useAuthStore } from "@/stores";
import { githubAPIClient } from "@/lib/api/github-api-client";

export interface DetailPanelIssue {
  id: number | string;
  title: string;
  url: string;
  repository?: string;
  repo?: string;
  author: {
    login: string;
    avatar_url?: string;
    avatarUrl?: string;
  };
  labels: Array<{ name: string; color?: string }>;
  priority?: "low" | "medium" | "high" | "urgent";
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  comments?: number;
  body?: string | null;
  description?: string;
  language?: string;
  stars?: number;
  type?: string;
}

interface DetailPanelProps {
  issue: DetailPanelIssue | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailPanel({ issue, isOpen, onClose }: DetailPanelProps) {
  const [comments, setComments] = useState<Array<{
    id: number;
    user: { login: string; avatar_url: string };
    body: string;
    created_at: string;
  }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [isClosing, setIsClosing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { addTaskFromActionItem, isActionItemAdded, removeActionItemFromKanban } = useKanbanStore();
  const { markAsRead } = useActionItemsStore();
  const { orgData } = useAuthStore();

  const isAlreadyAdded = issue ? isActionItemAdded(issue.id.toString()) : false;

  useEffect(() => {
    if (issue?.priority) {
      setSelectedPriority(issue.priority);
    }
  }, [issue]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!issue?.url || !isOpen || !orgData?.token) return;

      const urlMatch = issue.url.match(/github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/);
      if (!urlMatch) return;

      const [, owner, repo, , issueNumber] = urlMatch;

      setLoadingComments(true);
      githubAPIClient.setUserToken(orgData.token);

      try {
        const fetchedComments = await githubAPIClient.getIssueComments(
          owner,
          repo,
          parseInt(issueNumber, 10)
        );
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [issue, isOpen, orgData?.token]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAddToKanban = () => {
    if (!issue) return;
    try {
      const actionItem = {
        id: issue.id.toString(),
        title: issue.title,
        repo: issue.repository || issue.repo || "Unknown",
        type: issue.type === "pullRequest" ? ("pullRequest" as const) : ("issue" as const),
        priority: issue.priority || ("medium" as const),
        url: issue.url,
        createdAt: issue.created_at || issue.createdAt || new Date().toISOString(),
        updatedAt: issue.updated_at || issue.updatedAt || new Date().toISOString(),
        author: {
          login: issue.author.login,
          avatarUrl: issue.author.avatar_url || issue.author.avatarUrl || "",
        },
        labels: issue.labels.map(l => ({ name: l.name, color: l.color })),
        daysOld: 0,
      };
      addTaskFromActionItem(actionItem, "", "todo");
      setActionMessage({ type: "success", text: "Added to Kanban board" });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error("Failed to add to Kanban:", error);
      setActionMessage({ type: "error", text: "Failed to add to Kanban" });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleQuickStart = () => {
    if (!issue) return;
    try {
      const actionItem = {
        id: issue.id.toString(),
        title: issue.title,
        repo: issue.repository || issue.repo || "Unknown",
        type: issue.type === "pullRequest" ? ("pullRequest" as const) : ("issue" as const),
        priority: issue.priority || ("medium" as const),
        url: issue.url,
        createdAt: issue.created_at || issue.createdAt || new Date().toISOString(),
        updatedAt: issue.updated_at || issue.updatedAt || new Date().toISOString(),
        author: {
          login: issue.author.login,
          avatarUrl: issue.author.avatar_url || issue.author.avatarUrl || "",
        },
        labels: issue.labels.map(l => ({ name: l.name, color: l.color })),
        daysOld: 0,
      };
      addTaskFromActionItem(actionItem, "", "inProgress");
      setActionMessage({ type: "success", text: "Task started in Kanban" });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error("Failed to start task:", error);
      setActionMessage({ type: "error", text: "Failed to start task" });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRemoveFromKanban = () => {
    if (!issue) return;
    try {
      removeActionItemFromKanban(issue.id.toString());
      setActionMessage({ type: "success", text: "Removed from Kanban" });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error("Failed to remove from Kanban:", error);
      setActionMessage({ type: "error", text: "Failed to remove from Kanban" });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleClose = async () => {
    if (!issue?.url) return;

    const urlMatch = issue.url.match(/github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/);
    if (!urlMatch) return;

    setIsClosing(true);

    try {
      const itemType = issue.type === "pullRequest" ? "stale" : "assigned";
      await markAsRead(itemType as any, issue.id.toString());
      setActionMessage({ type: "success", text: `${issue.type === "pullRequest" ? "PR" : "Issue"} closed` });
      setTimeout(() => {
        setActionMessage(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to close:", error);
      setActionMessage({ type: "error", text: "Failed to close item" });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setIsClosing(false);
    }
  };

  if (!issue) return null;

  const repository = issue.repository || issue.repo || "Unknown Repository";
  const avatarUrl = issue.author.avatar_url || issue.author.avatarUrl;
  const createdAt = issue.created_at || issue.createdAt;
  const updatedAt = issue.updated_at || issue.updatedAt;
  const description = issue.body || issue.description;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
              Issue Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {actionMessage && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-md text-sm mb-3",
              actionMessage.type === "success"
                ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200"
                : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200"
            )}>
              {actionMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {actionMessage.text}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isAlreadyAdded ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFromKanban}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Remove from Kanban
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleQuickStart}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToKanban}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Kanban
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClose}
              disabled={isClosing}
              className="flex-1"
            >
              {isClosing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                  {issue.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-mono">#{issue.id}</span>
                  <span>•</span>
                  <span className="truncate">{repository}</span>
                </div>
              </div>
              {issue.url && (
                <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                  <a href={issue.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
              <Select value={selectedPriority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setSelectedPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge variant="secondary" className="capitalize">Low</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="default" className="capitalize">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="destructive" className="capitalize">High</Badge>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <Badge variant="destructive" className="capitalize">Urgent</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">Author</span>
              <UserHoverCard username={issue.author.login} showScore={true}>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avatarUrl} alt={issue.author.login} />
                    <AvatarFallback>
                      {issue.author.login.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {issue.author.login}
                  </span>
                </div>
              </UserHoverCard>
            </div>

            {createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">Created</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(createdAt)}
                </span>
              </div>
            )}

            {updatedAt && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">Updated</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(updatedAt)}
                </span>
              </div>
            )}

            {issue.comments !== undefined && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">Comments</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {issue.comments}
                </span>
              </div>
            )}

            {issue.labels.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 mt-1">Labels</span>
                <div className="flex flex-wrap gap-2">
                  {issue.labels.map((label, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      style={
                        label.color
                          ? {
                              borderColor: `#${label.color}`,
                              backgroundColor: `#${label.color}20`,
                              color: `#${label.color}`,
                            }
                          : undefined
                      }
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {description && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {description}
                </p>
              </div>
            </div>
          )}

          {(issue.language || issue.stars !== undefined || issue.type) && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Additional Info
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {issue.language && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Language:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {issue.language}
                    </span>
                  </div>
                )}
                {issue.stars !== undefined && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Repo Stars:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {issue.stars.toLocaleString()}
                    </span>
                  </div>
                )}
                {issue.type && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                      {issue.type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({comments.length})
            </h4>

            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No comments yet
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.user.avatar_url} alt={comment.user.login} />
                      <AvatarFallback>
                        {comment.user.login.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.user.login}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
