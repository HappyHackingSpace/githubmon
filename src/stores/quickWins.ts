import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { GitHubIssue } from "@/types/quickWins";
import { useDataCacheStore } from "./cache";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";
import { useAuthStore } from "./auth";

interface QuickWinsState {
  goodIssues: GitHubIssue[];
  easyFixes: GitHubIssue[];
  dismissedIssues: Set<number>;
  isHydrated: boolean;
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
  dismissIssue: (issueId: number) => void;
  undismissIssue: (issueId: number) => void;
  clearDismissed: () => void;
  hydrate: () => void;
}

export const useQuickWinsStore = create<QuickWinsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
  goodIssues: [],
  easyFixes: [],
  dismissedIssues: new Set<number>(),
  isHydrated: false,
  loading: { goodIssues: false, easyFixes: false },
  error: { goodIssues: null, easyFixes: null },

  hydrate: () => set({ isHydrated: true }),

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

  dismissIssue: (issueId: number) =>
    set((state) => {
      const newDismissed = new Set(state.dismissedIssues);
      newDismissed.add(issueId);
      return { dismissedIssues: newDismissed };
    }),

  undismissIssue: (issueId: number) =>
    set((state) => {
      const newDismissed = new Set(state.dismissedIssues);
      newDismissed.delete(issueId);
      return { dismissedIssues: newDismissed };
    }),

  clearDismissed: () => set({ dismissedIssues: new Set<number>() }),
      }),
      {
        name: "quick-wins-storage",
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const data = JSON.parse(str);
            return {
              ...data,
              state: {
                ...data.state,
                dismissedIssues: new Set(data.state.dismissedIssues || []),
              },
            };
          },
          setItem: (name, value) => {
            const data = {
              ...value,
              state: {
                ...value.state,
                dismissedIssues: Array.from(value.state.dismissedIssues),
              },
            };
            localStorage.setItem(name, JSON.stringify(data));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
        onRehydrateStorage: () => (state) => {
          state?.hydrate();
        },
      }
    )
  )
);
