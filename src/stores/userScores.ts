import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { UserScore, UserScoreCacheEntry } from "@/types/github";
import { githubAPIClient } from "@/lib/api/github-api-client";

interface UserScoresState {
  scores: Map<string, UserScoreCacheEntry>;
  isHydrated: boolean;

  getScore: (username: string) => UserScore | null;
  fetchScore: (username: string) => Promise<UserScore | null>;
  clearScore: (username: string) => void;
  clearAllScores: () => void;
  hydrate: () => void;
}

const CACHE_DURATION = 30 * 60 * 1000;

function calculateScore(commits: number, prs: number, stars: number): number {
  return commits * 2 + prs * 5 + stars;
}

function calculateLevel(score: number): "beginner" | "intermediate" | "advanced" | "expert" | "master" {
  if (score >= 1000) return "master";
  if (score >= 500) return "expert";
  if (score >= 250) return "advanced";
  if (score >= 100) return "intermediate";
  return "beginner";
}

export const useUserScoresStore = create<UserScoresState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        scores: new Map(),
        isHydrated: false,

        getScore: (username: string) => {
          const cached = get().scores.get(username);
          if (!cached) return null;

          const now = Date.now();
          if (now - cached.fetchedAt > CACHE_DURATION) {
            return null;
          }

          return cached.score;
        },

        fetchScore: async (username: string) => {
          const cached = get().getScore(username);
          if (cached) return cached;

          try {
            const contributions = await githubAPIClient.getUserContributions(username);
            const score = calculateScore(
              contributions.commits,
              contributions.prs,
              contributions.stars
            );
            const level = calculateLevel(score);

            const userScore: UserScore = {
              username,
              score,
              contributions,
              calculatedAt: new Date().toISOString(),
              level,
            };

            const cacheEntry: UserScoreCacheEntry = {
              username,
              score: userScore,
              fetchedAt: Date.now(),
            };

            set((state) => {
              const newScores = new Map(state.scores);
              newScores.set(username, cacheEntry);
              return { scores: newScores };
            });

            return userScore;
          } catch (error) {
            console.error(`Failed to fetch score for ${username}:`, error);
            return null;
          }
        },

        clearScore: (username: string) => {
          set((state) => {
            const newScores = new Map(state.scores);
            newScores.delete(username);
            return { scores: newScores };
          });
        },

        clearAllScores: () => {
          set({ scores: new Map() });
        },

        hydrate: () => {
          set({ isHydrated: true });
        },
      }),
      {
        name: "user-scores-storage",
        onRehydrateStorage: () => (state) => {
          state?.hydrate();
        },
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const data = JSON.parse(str);
            return {
              state: {
                ...data.state,
                scores: new Map(Object.entries(data.state.scores || {})),
              },
            };
          },
          setItem: (name, value) => {
            const scoresObj = Object.fromEntries(value.state.scores || new Map());
            const data = {
              state: {
                ...value.state,
                scores: scoresObj,
              },
            };
            localStorage.setItem(name, JSON.stringify(data));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    )
  )
);
