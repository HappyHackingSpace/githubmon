"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, useActionItemsStore } from "@/stores";
import { useQuickWinsStore } from "@/stores/quickWins";
import { githubAPIClient } from "@/lib/api/github-api-client";

export function DataInitializer() {
  const { isConnected, orgData, isTokenValid } = useAuthStore();
  const { refreshData } = useActionItemsStore();
  const { fetchGoodIssues, fetchEasyFixes } = useQuickWinsStore();

  const initializedRef = useRef(false);
  const tokenValid = isTokenValid();

  useEffect(() => {
    if (isConnected && orgData?.token && tokenValid) {
      try {
        githubAPIClient.setUserToken(orgData.token);
      } catch (error) {
        console.error("Failed to set GitHub API token:", error);
      }

      if (!initializedRef.current) {
        initializedRef.current = true;
        refreshData();
        fetchGoodIssues();
        fetchEasyFixes();
      }
    } else if (!isConnected || !orgData?.token) {
      githubAPIClient.clearToken();
      initializedRef.current = false;
    }
  }, [
    isConnected,
    orgData?.token,
    tokenValid,
    refreshData,
    fetchGoodIssues,
    fetchEasyFixes,
  ]);

  return null;
}
