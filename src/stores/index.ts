import { useEffect, useState } from "react";
import { useAuthStore } from "./auth";
import { usePreferencesStore } from "./preferences";
import { useSearchStore } from "./search";
import { useDataCacheStore } from "./cache";
import { useAppStore } from "./app";
export { useAuthStore } from "./auth";
export { usePreferencesStore } from "./preferences";
export { useSearchStore } from "./search";
export { useDataCacheStore } from "./cache";
export { useAppStore } from "./app";
export { useActionItemsStore } from "./actionItems";

// ============ HYDRATION HOOK ============

let hydrationPromise: Promise<void> | null = null;
let isHydrated = false;

const hydrateStores = async () => {
  if (hydrationPromise) return hydrationPromise;
  if (isHydrated) return Promise.resolve();

  hydrationPromise = (async () => {
    await Promise.all([
      Promise.resolve(useAuthStore.getState().hydrate()),
      usePreferencesStore.persist.rehydrate(),
      useSearchStore.persist.rehydrate(),
      useDataCacheStore.persist.rehydrate(),
    ]);
    isHydrated = true;
  })();

  return hydrationPromise;
};

export const useStoreHydration = () => {
  const [hasHydrated, setHasHydrated] = useState(isHydrated);
  const authHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      hydrateStores().then(() => setHasHydrated(true));
    }
  }, []);

  // Auth store has its own hydration state
  return hasHydrated && authHydrated;
};

// ============ SAFE SELECTORS (SSR-friendly) ============
const defaultPreferences = {
  theme: "system" as const,
  defaultSearchType: "all" as const,
  searchResultsPerPage: 20,
  defaultPeriod: "24h" as const,
  favoriteLanguages: [],
  pinnedRepos: [],
  sidebarCollapsed: false,
  compactMode: false,
  showTutorials: true,
  enableNotifications: true,
  notifyOnTrends: false,
};

export const usePreferences = () => {
  const hasHydrated = useStoreHydration();
  const store = usePreferencesStore();

  if (!hasHydrated) {
    return {
      ...defaultPreferences,
      setTheme: () => {},
      setDefaultSearchType: () => {},
      setDefaultPeriod: () => {},
      toggleFavoriteLanguage: () => {},
      togglePinnedRepo: () => {},
      setSidebarCollapsed: () => {},
      setCompactMode: () => {},
      setShowTutorials: () => {},
      setNotifications: () => {},
      resetPreferences: () => {},
    };
  }

  return store;
};

export const useSearch = () => {
  const hasHydrated = useStoreHydration();
  const store = useSearchStore();

  if (!hasHydrated) {
    return {
      isSearchModalOpen: false,
      currentQuery: "",
      currentSearchType: "all" as const,
      currentResults: { repos: [], users: [], loading: false, error: null },
      searchHistory: [],
      recentSearches: [],
      setSearchModalOpen: () => {},
      setCurrentQuery: () => {},
      setCurrentSearchType: () => {},
      setSearchResults: () => {},
      addToHistory: () => {},
      clearHistory: () => {},
      clearRecentSearches: () => {},
    };
  }

  return store;
};

export const useDataCache = () => {
  const hasHydrated = useStoreHydration();
  const store = useDataCacheStore();

  if (!hasHydrated) {
    return {
      rateLimitInfo: null,
      setRateLimit: () => {},
    };
  }

  return store;
};

export const useApp = () => {
  const hasHydrated = useStoreHydration();
  const store = useAppStore();

  if (!hasHydrated) {
    return {
      sidebarOpen: false,
      notifications: [],
      setSidebarOpen: () => {},
      addNotification: () => {},
      removeNotification: () => {},
      clearNotifications: () => {},
    };
  }

  return store;
};

export const useIsAuthenticated = () => {
  const hasHydrated = useStoreHydration();
  const { isConnected, orgData, isTokenValid } = useAuthStore();

  if (!hasHydrated) return false;
  return isConnected && orgData?.token && isTokenValid();
};

export const useTheme = () => {
  const { theme } = usePreferences();
  return theme;
};

export const useSidebarState = () => {
  const { sidebarOpen: isOpen, setSidebarOpen: setOpen } = useApp();
  return { isOpen, setOpen };
};

export const useNotifications = () => {
  const {
    notifications,
    addNotification: add,
    removeNotification: remove,
    clearNotifications: clear,
  } = useApp();
  return { notifications, add, remove, clear };
};
