// stores/preferences.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserPreferencesState {
  theme: "light" | "dark" | "system";

  defaultSearchType: "all" | "repos" | "users";
  searchResultsPerPage: number;

  defaultPeriod: "24h" | "7d" | "30d";
  favoriteLanguages: string[];
  pinnedRepos: string[];
  favoriteUsers: string[];

  // UI preferences
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showTutorials: boolean;

  // Notification preferences
  enableNotifications: boolean;
  notifyOnTrends: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setDefaultSearchType: (type: "all" | "repos" | "users") => void;
  setDefaultPeriod: (period: "24h" | "7d" | "30d") => void;
  toggleFavoriteLanguage: (language: string) => void;
  togglePinnedRepo: (repoFullName: string) => void;
  toggleFavoriteUser: (username: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setShowTutorials: (show: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setNotifyOnTrends: (enabled: boolean) => void;
  setSearchResultsPerPage: (resultsPerPage: number) => void;
  resetPreferences: () => void;
}

const defaultPreferences = {
  theme: "system" as const,
  defaultSearchType: "all" as const,
  searchResultsPerPage: 20,
  defaultPeriod: "24h" as const,
  favoriteLanguages: [],
  pinnedRepos: [],
  favoriteUsers: [],
  sidebarCollapsed: false,
  compactMode: false,
  showTutorials: true,
  enableNotifications: true,
  notifyOnTrends: false,
};

export const usePreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setTheme: (theme) => set({ theme }),
      setDefaultSearchType: (defaultSearchType) => set({ defaultSearchType }),
      setDefaultPeriod: (defaultPeriod) => set({ defaultPeriod }),

      toggleFavoriteLanguage: (language) =>
        set((state) => ({
          favoriteLanguages: state.favoriteLanguages.includes(language)
            ? state.favoriteLanguages.filter((l) => l !== language)
            : [...state.favoriteLanguages, language],
        })),

      togglePinnedRepo: (repoFullName) =>
        set((state) => ({
          pinnedRepos: state.pinnedRepos.includes(repoFullName)
            ? state.pinnedRepos.filter((r) => r !== repoFullName)
            : [...state.pinnedRepos, repoFullName],
        })),

      toggleFavoriteUser: (username) =>
        set((state) => ({
          favoriteUsers: state.favoriteUsers.includes(username)
            ? state.favoriteUsers.filter((u) => u !== username)
            : [...state.favoriteUsers, username],
        })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setShowTutorials: (showTutorials) => set({ showTutorials }),
      setNotifications: (enableNotifications) => set({ enableNotifications }),
      setSearchResultsPerPage: (searchResultsPerPage) =>
        set({ searchResultsPerPage }),
      setNotifyOnTrends: (notifyOnTrends) => set({ notifyOnTrends }),
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: "githubmon-preferences",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      skipHydration: true,
    }
  )
);
