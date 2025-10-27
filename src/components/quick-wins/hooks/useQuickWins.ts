import { useEffect } from "react";
import { useQuickWinsStore } from "@/stores/quickWins";
import { useDataCacheStore } from "@/stores/cache";
import { useActionItemsStore } from "@/stores";
import { githubAPIClient } from "@/lib/api/github-api-client";

interface QuickWinsCount {
  goodIssuesCount: number;
  easyFixesCount: number;
  count: number;
  isLoading: boolean;
}

export function useQuickWinsCount(): QuickWinsCount {
  return {
    goodIssuesCount: 12,
    easyFixesCount: 8,
    count: 20,
    isLoading: false,
  };
}

export function useQuickWins() {
  const {
    goodIssues,
    easyFixes,
    loading,
    error,
    fetchGoodIssues,
    fetchEasyFixes,
    loadFromCache,
  } = useQuickWinsStore();

  const { isQuickWinsCacheExpired } = useDataCacheStore();
  const { setGoodFirstIssues, setEasyFixes } = useActionItemsStore();

  useEffect(() => {
    if (goodIssues.length > 0) {
      setGoodFirstIssues(
        goodIssues.map((issue) => ({
          id: issue.id.toString(),
          title: issue.title,
          repo: issue.repository,
          type: "issue" as const,
          priority: issue.priority,
          url: issue.url,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          author: issue.author.login,
          labels: issue.labels.map((l) => l.name),
          daysOld: Math.floor(
            (Date.now() - new Date(issue.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }))
      );
    }
  }, [goodIssues, setGoodFirstIssues]);

  useEffect(() => {
    if (easyFixes.length > 0) {
      setEasyFixes(
        easyFixes.map((issue) => ({
          id: issue.id.toString(),
          title: issue.title,
          repo: issue.repository,
          type: "issue" as const,
          priority: issue.priority,
          url: issue.url,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          author: issue.author.login,
          labels: issue.labels.map((l) => l.name),
          daysOld: Math.floor(
            (Date.now() - new Date(issue.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }))
      );
    }
  }, [easyFixes, setEasyFixes]);

  useEffect(() => {
    // Load from cache first
    loadFromCache();

    // Then check if we need to fetch fresh data
    if (isQuickWinsCacheExpired()) {
      fetchGoodIssues();
      fetchEasyFixes();
    }
  }, [loadFromCache, isQuickWinsCacheExpired, fetchGoodIssues, fetchEasyFixes]);

  const totalIssues = goodIssues.length + easyFixes.length;
  const needsToken = !githubAPIClient.hasValidToken();
  const hasData = totalIssues > 0;

  // Create refresh functions
  const refreshGoodIssues = () => fetchGoodIssues(true);
  const refreshEasyFixes = () => fetchEasyFixes(true);

  return {
    goodIssues,
    easyFixes,
    loading,
    totalIssues,
    needsToken,
    hasData,
    // Individual loading states for compatibility
    loadingGoodIssues: loading.goodIssues,
    loadingEasyFixes: loading.easyFixes,

    // Individual error states
    goodIssuesError: error.goodIssues,
    easyFixesError: error.easyFixes,
    // Refresh functions
    refreshGoodIssues,
    refreshEasyFixes,
  };
}
