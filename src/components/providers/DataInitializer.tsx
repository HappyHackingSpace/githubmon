"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, useActionItemsStore } from "@/stores";
import { useQuickWinsStore } from "@/stores/quickWins";

export function DataInitializer() {
  const { isConnected, orgData, isTokenValid } = useAuthStore();
  const { refreshData } = useActionItemsStore();
  const { fetchGoodIssues, fetchEasyFixes } = useQuickWinsStore();

  const initializedRef = useRef(false);
  const tokenValid = isTokenValid();
  useEffect(() => {
    if (!initializedRef.current && isConnected && orgData && tokenValid) {
      initializedRef.current = true;
      refreshData();
      fetchGoodIssues();
      fetchEasyFixes();
    }
  }, [
    isConnected,
    orgData,
    tokenValid,
    refreshData,
    fetchGoodIssues,
    fetchEasyFixes,
  ]);

  return null;
}
