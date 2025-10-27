import { useAuthStore, useStoreHydration } from "@/stores";

export const useAuth = () => {
  const hasHydrated = useStoreHydration();
  const { isConnected, orgData, isTokenValid, logout } = useAuthStore();

  const isAuthenticated =
    hasHydrated && isConnected && orgData && isTokenValid();

  return {
    isAuthenticated,
    hasHydrated,
    isConnected,
    orgData,
    logout,
    isLoading: !hasHydrated,
  };
};

export const useRequireAuth = () => {
  const authData = useAuth();

  return {
    ...authData,
    shouldRender: authData.hasHydrated,
  };
};

export const useRequireGuest = () => {
  const authData = useAuth();

  return {
    ...authData,
    shouldRender: authData.hasHydrated,
  };
};
