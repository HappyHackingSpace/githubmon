import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FavoriteCategory {
  id: string;
  name: string;
  color: string;
}

export interface FavoriteRepoMetadata {
  fullName: string;
  dateAdded: number;
  categoryId: string | null;
  notes: string;
}

export interface FavoriteUserMetadata {
  username: string;
  dateAdded: number;
  categoryId: string | null;
  notes: string;
}

interface UserPreferencesState {
  theme: "light" | "dark" | "system";

  defaultSearchType: "all" | "repos" | "users";
  searchResultsPerPage: number;

  defaultPeriod: "24h" | "7d" | "30d";
  favoriteLanguages: string[];
  pinnedRepos: string[];
  favoriteUsers: string[];

  categories: FavoriteCategory[];
  repoMetadata: Record<string, FavoriteRepoMetadata>;
  userMetadata: Record<string, FavoriteUserMetadata>;

  sidebarCollapsed: boolean;
  compactMode: boolean;
  showTutorials: boolean;

  enableNotifications: boolean;
  notifyOnTrends: boolean;

  setTheme: (theme: "light" | "dark" | "system") => void;
  setDefaultSearchType: (type: "all" | "repos" | "users") => void;
  setDefaultPeriod: (period: "24h" | "7d" | "30d") => void;
  toggleFavoriteLanguage: (language: string) => void;
  togglePinnedRepo: (repoFullName: string, categoryId?: string | null) => void;
  toggleFavoriteUser: (username: string, categoryId?: string | null) => void;

  addCategory: (name: string, color: string) => string;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;

  setRepoCategory: (repoFullName: string, categoryId: string | null) => void;
  setUserCategory: (username: string, categoryId: string | null) => void;
  setRepoNotes: (repoFullName: string, notes: string) => void;
  setUserNotes: (username: string, notes: string) => void;

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
  categories: [
    { id: "work", name: "Work", color: "#3b82f6" },
    { id: "learning", name: "Learning", color: "#10b981" },
    { id: "inspiration", name: "Inspiration", color: "#f59e0b" },
  ] as FavoriteCategory[],
  repoMetadata: {} as Record<string, FavoriteRepoMetadata>,
  userMetadata: {} as Record<string, FavoriteUserMetadata>,
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

      togglePinnedRepo: (repoFullName, categoryId = null) =>
        set((state) => {
          const isRemoving = state.pinnedRepos.includes(repoFullName);

          if (isRemoving) {
            const newMetadata = { ...state.repoMetadata };
            delete newMetadata[repoFullName];

            return {
              pinnedRepos: state.pinnedRepos.filter((r) => r !== repoFullName),
              repoMetadata: newMetadata,
            };
          } else {
            return {
              pinnedRepos: [...state.pinnedRepos, repoFullName],
              repoMetadata: {
                ...state.repoMetadata,
                [repoFullName]: {
                  fullName: repoFullName,
                  dateAdded: Date.now(),
                  categoryId,
                  notes: "",
                },
              },
            };
          }
        }),

      toggleFavoriteUser: (username, categoryId = null) =>
        set((state) => {
          const isRemoving = state.favoriteUsers.includes(username);

          if (isRemoving) {
            const newMetadata = { ...state.userMetadata };
            delete newMetadata[username];

            return {
              favoriteUsers: state.favoriteUsers.filter((u) => u !== username),
              userMetadata: newMetadata,
            };
          } else {
            return {
              favoriteUsers: [...state.favoriteUsers, username],
              userMetadata: {
                ...state.userMetadata,
                [username]: {
                  username,
                  dateAdded: Date.now(),
                  categoryId,
                  notes: "",
                },
              },
            };
          }
        }),

      addCategory: (name, color) => {
        const id = `cat-${Date.now()}`;
        set((state) => ({
          categories: [...state.categories, { id, name, color }],
        }));
        return id;
      },

      updateCategory: (id, name, color) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, name, color } : cat
          ),
        })),

      deleteCategory: (id) =>
        set((state) => {
          const newRepoMetadata = { ...state.repoMetadata };
          Object.keys(newRepoMetadata).forEach((key) => {
            if (newRepoMetadata[key].categoryId === id) {
              newRepoMetadata[key] = { ...newRepoMetadata[key], categoryId: null };
            }
          });

          const newUserMetadata = { ...state.userMetadata };
          Object.keys(newUserMetadata).forEach((key) => {
            if (newUserMetadata[key].categoryId === id) {
              newUserMetadata[key] = { ...newUserMetadata[key], categoryId: null };
            }
          });

          return {
            categories: state.categories.filter((cat) => cat.id !== id),
            repoMetadata: newRepoMetadata,
            userMetadata: newUserMetadata,
          };
        }),

      setRepoCategory: (repoFullName, categoryId) =>
        set((state) => ({
          repoMetadata: {
            ...state.repoMetadata,
            [repoFullName]: {
              ...state.repoMetadata[repoFullName],
              categoryId,
            },
          },
        })),

      setUserCategory: (username, categoryId) =>
        set((state) => ({
          userMetadata: {
            ...state.userMetadata,
            [username]: {
              ...state.userMetadata[username],
              categoryId,
            },
          },
        })),

      setRepoNotes: (repoFullName, notes) =>
        set((state) => ({
          repoMetadata: {
            ...state.repoMetadata,
            [repoFullName]: {
              ...state.repoMetadata[repoFullName],
              notes,
            },
          },
        })),

      setUserNotes: (username, notes) =>
        set((state) => ({
          userMetadata: {
            ...state.userMetadata,
            [username]: {
              ...state.userMetadata[username],
              notes,
            },
          },
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
