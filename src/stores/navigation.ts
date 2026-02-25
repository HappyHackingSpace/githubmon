import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface NavigationHistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

interface NavigationState {
  recentPages: NavigationHistoryItem[];
  isCommandPaletteOpen: boolean;
  isQuickTaskOpen: boolean;

  addToHistory: (path: string, title: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickTaskOpen: (open: boolean) => void;
  clearHistory: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      recentPages: [],
      isCommandPaletteOpen: false,
      isQuickTaskOpen: false,

      addToHistory: (path, title) => {
        set((state) => {
          const newEntry: NavigationHistoryItem = {
            path,
            title,
            timestamp: Date.now(),
          };

          const filteredHistory = state.recentPages.filter(
            (item) => item.path !== path
          );

          return {
            recentPages: [newEntry, ...filteredHistory].slice(0, 5),
          };
        });
      },

      setCommandPaletteOpen: (isCommandPaletteOpen) =>
        set({ isCommandPaletteOpen }),

      setQuickTaskOpen: (isQuickTaskOpen) =>
        set({ isQuickTaskOpen }),

      clearHistory: () => set({ recentPages: [] }),
    }),
    {
      name: "githubmon-navigation",
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
        recentPages: state.recentPages,
      }),
      skipHydration: true,
    }
  )
);
