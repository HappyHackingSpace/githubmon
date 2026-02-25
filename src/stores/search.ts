// stores/search.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TrendingRepo, TopContributor } from "@/types/oss-insight";

interface SearchState {
  // Search modal state
  isSearchModalOpen: boolean;

  // Current search
  currentQuery: string;
  currentSearchType: "all" | "repos" | "users";
  currentResults: {
    repos: TrendingRepo[];
    users: TopContributor[];
    loading: boolean;
    error: string | null;
  };

  // Search history
  searchHistory: Array<{
    query: string;
    type: "all" | "repos" | "users";
    timestamp: number;
  }>;

  // Recent searches (for quick access)
  recentSearches: string[];

  // Unified command palette search
  isUnifiedSearchLoading: boolean;
  unifiedResults: {
    repos: TrendingRepo[];
    users: TopContributor[];
  };

  // Actions
  setSearchModalOpen: (open: boolean) => void;
  setUnifiedSearchLoading: (loading: boolean) => void;
  setUnifiedResults: (results: { repos: TrendingRepo[]; users: TopContributor[] }) => void;
  setCurrentQuery: (query: string) => void;
  setCurrentSearchType: (type: "all" | "repos" | "users") => void;
  setSearchResults: (results: SearchState["currentResults"]) => void;
  addToHistory: (query: string, type: "all" | "repos" | "users") => void;
  clearHistory: () => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      isSearchModalOpen: false,
      currentQuery: "",
      currentSearchType: "all",
      currentResults: {
        repos: [],
        users: [],
        loading: false,
        error: null,
      },
      searchHistory: [],
      recentSearches: [],
      isUnifiedSearchLoading: false,
      unifiedResults: {
        repos: [],
        users: [],
      },

      setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
      setUnifiedSearchLoading: (isUnifiedSearchLoading) => set({ isUnifiedSearchLoading }),
      setUnifiedResults: (unifiedResults) => set({ unifiedResults }),
      setCurrentQuery: (currentQuery) => set({ currentQuery }),
      setCurrentSearchType: (currentSearchType) => set({ currentSearchType }),
      setSearchResults: (currentResults) => set({ currentResults }),

      addToHistory: (query, type) => {
        if (!query.trim()) return;

        set((state) => {
          const newEntry = { query, type, timestamp: Date.now() };
          const filteredHistory = state.searchHistory.filter(
            (h) => h.query !== query
          );
          const newHistory = [newEntry, ...filteredHistory].slice(0, 50);

          const newRecent = [
            query,
            ...state.recentSearches.filter((r) => r !== query),
          ].slice(0, 10);

          return {
            searchHistory: newHistory,
            recentSearches: newRecent,
          };
        });
      },

      clearHistory: () => set({ searchHistory: [] }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "githubmon-search",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
        currentSearchType: state.currentSearchType,
      }),
      skipHydration: true,
    }
  )
);
