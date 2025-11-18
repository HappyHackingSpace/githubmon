import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export interface RepoMetrics {
  fullName: string;
  stars: number;
  previousStars: number;
  starChange: number;
  newIssues24h: number;
  language: string | null;
  description: string | null;
  lastActivity: string;
  url: string;
}

export interface UserMetrics {
  username: string;
  avatarUrl: string;
  recentActivity: number;
  topLanguages: string[];
  reposCount: number;
  followers: number;
  bio: string | null;
  url: string;
}

interface FavoritesState {
  repoMetrics: Record<string, RepoMetrics>;
  userMetrics: Record<string, UserMetrics>;
  lastFetchedAt: Record<string, number>;
  isHydrated: boolean;
  loading: {
    repos: Record<string, boolean>;
    users: Record<string, boolean>;
  };
  error: {
    repos: Record<string, string | null>;
    users: Record<string, string | null>;
  };
  fetchRepoMetrics: (repoFullName: string) => Promise<void>;
  fetchUserMetrics: (username: string) => Promise<void>;
  fetchAllFavorites: (repos: string[], users: string[]) => Promise<void>;
  clearMetrics: () => void;
  hydrate: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000;

export const useFavoritesStore = create<FavoritesState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        repoMetrics: {},
        userMetrics: {},
        lastFetchedAt: {},
        isHydrated: false,
        loading: { repos: {}, users: {} },
        error: { repos: {}, users: {} },

        hydrate: () => set({ isHydrated: true }),

        fetchRepoMetrics: async (repoFullName: string) => {
          const state = get();
          const lastFetched = state.lastFetchedAt[`repo-${repoFullName}`];

          if (
            lastFetched &&
            Date.now() - lastFetched < CACHE_DURATION
          ) {
            return;
          }

          set((state) => ({
            loading: {
              ...state.loading,
              repos: { ...state.loading.repos, [repoFullName]: true },
            },
            error: {
              ...state.error,
              repos: { ...state.error.repos, [repoFullName]: null },
            },
          }));

          try {
            const response = await fetch(
              `/api/favorites/repo?name=${encodeURIComponent(repoFullName)}`
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch repo metrics: ${response.statusText}`);
            }

            const metrics: RepoMetrics = await response.json();

            set((state) => ({
              repoMetrics: { ...state.repoMetrics, [repoFullName]: metrics },
              lastFetchedAt: {
                ...state.lastFetchedAt,
                [`repo-${repoFullName}`]: Date.now(),
              },
              loading: {
                ...state.loading,
                repos: { ...state.loading.repos, [repoFullName]: false },
              },
            }));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set((state) => ({
              loading: {
                ...state.loading,
                repos: { ...state.loading.repos, [repoFullName]: false },
              },
              error: {
                ...state.error,
                repos: { ...state.error.repos, [repoFullName]: errorMessage },
              },
            }));
          }
        },

        fetchUserMetrics: async (username: string) => {
          const state = get();
          const lastFetched = state.lastFetchedAt[`user-${username}`];

          if (
            lastFetched &&
            Date.now() - lastFetched < CACHE_DURATION
          ) {
            return;
          }

          set((state) => ({
            loading: {
              ...state.loading,
              users: { ...state.loading.users, [username]: true },
            },
            error: {
              ...state.error,
              users: { ...state.error.users, [username]: null },
            },
          }));

          try {
            const response = await fetch(
              `/api/favorites/user?username=${encodeURIComponent(username)}`
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch user metrics: ${response.statusText}`);
            }

            const metrics: UserMetrics = await response.json();

            set((state) => ({
              userMetrics: { ...state.userMetrics, [username]: metrics },
              lastFetchedAt: {
                ...state.lastFetchedAt,
                [`user-${username}`]: Date.now(),
              },
              loading: {
                ...state.loading,
                users: { ...state.loading.users, [username]: false },
              },
            }));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set((state) => ({
              loading: {
                ...state.loading,
                users: { ...state.loading.users, [username]: false },
              },
              error: {
                ...state.error,
                users: { ...state.error.users, [username]: errorMessage },
              },
            }));
          }
        },

        fetchAllFavorites: async (repos: string[], users: string[]) => {
          const fetchRepoMetrics = get().fetchRepoMetrics;
          const fetchUserMetrics = get().fetchUserMetrics;

          await Promise.all([
            ...repos.map((repo) => fetchRepoMetrics(repo)),
            ...users.map((user) => fetchUserMetrics(user)),
          ]);
        },

        clearMetrics: () =>
          set({
            repoMetrics: {},
            userMetrics: {},
            lastFetchedAt: {},
            loading: { repos: {}, users: {} },
            error: { repos: {}, users: {} },
          }),
      }),
      {
        name: "favorites-metrics-storage",
        onRehydrateStorage: () => (state) => {
          state?.hydrate();
        },
      }
    )
  )
);
