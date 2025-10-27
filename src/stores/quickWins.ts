import { create } from "zustand";
import { GitHubIssue } from "@/types/quickWins";
import { useDataCacheStore } from "./cache";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";
import { useAuthStore } from "./auth";

interface QuickWinsState {
  goodIssues: GitHubIssue[];
  easyFixes: GitHubIssue[];
  loading: {
    goodIssues: boolean;
    easyFixes: boolean;
  };
  error: {
    goodIssues: string | null;
    easyFixes: string | null;
  };
  fetchGoodIssues: (forceRefresh?: boolean) => Promise<void>;
  fetchEasyFixes: (forceRefresh?: boolean) => Promise<void>;
  loadFromCache: () => void;
}

export const useQuickWinsStore = create<QuickWinsState>((set, get) => ({
  goodIssues: [],
  easyFixes: [],
  loading: { goodIssues: false, easyFixes: false },
  error: { goodIssues: null, easyFixes: null },

  loadFromCache: () => {
    const cache = useDataCacheStore.getState().getQuickWinsCache();
    if (cache) {
      set({
        goodIssues: cache.goodIssues,
        easyFixes: cache.easyFixes,
      });
    }
  },

  fetchGoodIssues: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cache = useDataCacheStore.getState().getQuickWinsCache();
      if (cache && cache.goodIssues.length > 0) {
        set((state) => ({
          goodIssues: cache.goodIssues,
          loading: { ...state.loading, goodIssues: false },
        }));
        return;
      }
    }

    set((state) => ({
      loading: { ...state.loading, goodIssues: true },
      error: { ...state.error, goodIssues: null },
    }));

    try {
      const authState = useAuthStore.getState();
      const userToken = authState.orgData?.token;

      if (!userToken) {
        throw new Error("GitHub token required");
      }

      githubGraphQLClient.setToken(userToken);

      const issues = await githubGraphQLClient.getGoodFirstIssues(100);

      set((state) => ({
        goodIssues: issues,
        loading: { ...state.loading, goodIssues: false },
        error: { ...state.error, goodIssues: null },
      }));

      const currentState = get();
      useDataCacheStore.getState().setQuickWinsCache({
        goodIssues: issues,
        easyFixes: currentState.easyFixes,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set((state) => ({
        goodIssues: [],
        loading: { ...state.loading, goodIssues: false },
        error: { ...state.error, goodIssues: errorMessage },
      }));
    }
  },
  fetchEasyFixes: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cache = useDataCacheStore.getState().getQuickWinsCache();
      if (cache && cache.easyFixes.length > 0) {
        set((state) => ({
          easyFixes: cache.easyFixes,
          loading: { ...state.loading, easyFixes: false },
        }));
        return;
      }
    }

    set((state) => ({
      loading: { ...state.loading, easyFixes: true },
      error: { ...state.error, easyFixes: null },
    }));

    try {
      const authState = useAuthStore.getState();
      const userToken = authState.orgData?.token;

      if (!userToken) {
        throw new Error("GitHub token required");
      }

      githubGraphQLClient.setToken(userToken);

      const issues = await githubGraphQLClient.getEasyFixes(100);

      set((state) => ({
        easyFixes: issues,
        loading: { ...state.loading, easyFixes: false },
        error: { ...state.error, easyFixes: null },
      }));

      const currentState = get();
      useDataCacheStore.getState().setQuickWinsCache({
        goodIssues: currentState.goodIssues,
        easyFixes: issues,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set((state) => ({
        easyFixes: [],
        loading: { ...state.loading, easyFixes: false },
        error: { ...state.error, easyFixes: errorMessage },
      }));
    }
  },
}));
