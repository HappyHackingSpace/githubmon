"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, PlusCircle } from "lucide-react";
import { githubAPIClient } from "@/lib/api/github-api-client";
import { useAuthStore } from "@/stores";

interface NewIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRepo?: string;
}

export function NewIssueDialog({ open, onOpenChange, defaultRepo }: NewIssueDialogProps) {
  const [repo, setRepo] = useState(defaultRepo || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [labels, setLabels] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIssueUrl, setCreatedIssueUrl] = useState<string | null>(null);

  const { orgData } = useAuthStore();

  const handleReset = () => {
    setRepo(defaultRepo || "");
    setTitle("");
    setBody("");
    setLabels("");
    setError(null);
    setSuccess(false);
    setCreatedIssueUrl(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !repo.trim()) {
      setError("Title and repository are required");
      return;
    }

    if (!orgData?.token) {
      setError("GitHub token not found. Please reconnect your GitHub account.");
      return;
    }

    const repoParts = repo.trim().split("/");
    if (repoParts.length !== 2) {
      setError("Repository must be in format: owner/repo");
      return;
    }

    const [owner, repoName] = repoParts;

    setIsCreating(true);
    setError(null);

    githubAPIClient.setUserToken(orgData.token);

    try {
      const labelArray = labels
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const result = await githubAPIClient.createIssue(
        owner,
        repoName,
        title.trim(),
        body.trim() || undefined,
        labelArray.length > 0 ? labelArray : undefined
      );

      if (result.success && result.issue) {
        setSuccess(true);
        setCreatedIssueUrl(result.issue.html_url);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(result.error || "Failed to create issue");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New GitHub Issue</DialogTitle>
          <DialogDescription>
            Create a new issue in a GitHub repository
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-medium">Issue Created Successfully!</p>
            {createdIssueUrl && (
              <Button asChild variant="outline">
                <a href={createdIssueUrl} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="repo" className="text-sm font-medium">
                  Repository <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="repo"
                  placeholder="owner/repository"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Format: owner/repository (e.g., facebook/react)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="body"
                  placeholder="Detailed description of the issue..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labels" className="text-sm font-medium">
                  Labels (Optional)
                </Label>
                <Input
                  id="labels"
                  placeholder="bug, enhancement, documentation"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comma-separated list of labels
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Issue
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
