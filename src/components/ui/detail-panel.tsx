"use client";

import { useEffect } from "react";
import { X, ExternalLink, Calendar, MessageCircle, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserHoverCard } from "@/components/ui/user-hover-card";
import { cn } from "@/lib/utils";

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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800";
    }
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
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
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

            {issue.priority && (
              <Badge className={cn("mb-4", getPriorityColor(issue.priority))}>
                {issue.priority.toUpperCase()}
              </Badge>
            )}
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
        </div>
      </div>
    </>
  );
}
