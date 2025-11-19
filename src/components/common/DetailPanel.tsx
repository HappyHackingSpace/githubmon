"use client";

import { X, ExternalLink, Calendar, MessageCircle, Tag, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export interface IssueDetail {
  number: number;
  title: string;
  body: string | null;
  url: string;
  repository: string;
  repositoryUrl: string;
  state: "open" | "closed";
  author: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  comments: number;
  assignees?: Array<{
    login: string;
    avatar_url: string;
  }>;
}

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  issue: IssueDetail | null;
  comments?: Array<{
    id: number;
    user: {
      login: string;
      avatar_url: string;
    };
    body: string;
    created_at: string;
  }>;
  loading?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DetailPanel({ isOpen, onClose, issue, comments, loading }: DetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[600px] bg-background border-l border-border z-50 shadow-2xl transform transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Issue Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {!loading && issue && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="font-mono">#{issue.number}</span>
                    <Badge variant={issue.state === "open" ? "default" : "secondary"}>
                      {issue.state}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{issue.title}</h3>
                  <a
                    href={issue.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {issue.repository}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={issue.author.avatar_url} alt={issue.author.login} />
                    <AvatarFallback>{issue.author.login.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{issue.author.login}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Opened {formatDate(issue.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{issue.comments} comments</span>
                </div>
              </div>

              {issue.labels && issue.labels.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.map((label, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        style={{
                          borderColor: `#${label.color}`,
                          backgroundColor: `#${label.color}20`,
                          color: `#${label.color}`,
                        }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {issue.assignees && issue.assignees.length > 0 && (
                <div className="flex items-start gap-2">
                  <UserIcon className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {issue.assignees.map((assignee, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={assignee.avatar_url} alt={assignee.login} />
                          <AvatarFallback>{assignee.login.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.login}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Description</h4>
                <Card>
                  <CardContent className="p-4">
                    {issue.body ? (
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {issue.body}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No description provided.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {comments && comments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recent Comments ({comments.length})</h4>
                  <div className="space-y-3">
                    {comments.slice(0, 5).map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={comment.user.avatar_url} alt={comment.user.login} />
                              <AvatarFallback>{comment.user.login.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.user.login}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {comment.body}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {comments.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {comments.length - 5} more comments...
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={issue.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
