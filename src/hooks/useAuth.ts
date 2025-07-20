// hooks/useAuth.ts
import { useAuthStore, useStoreHydration } from '@/stores'

// Basit auth durumu kontrolü - middleware auth routing'i hallediyor
export const useAuth = () => {
    const hasHydrated = useStoreHydration()
    const { isConnected, orgData, isTokenValid, logout } = useAuthStore()

    const isAuthenticated = hasHydrated && isConnected && orgData && isTokenValid()

    return {
        isAuthenticated,
        hasHydrated,
        isConnected,
        orgData,
        logout,
        isLoading: !hasHydrated
    }
}

// Protected sayfalar için - middleware zaten routing'i hallediyor
export const useRequireAuth = () => {
    const authData = useAuth()

    return {
        ...authData,
        // Middleware zaten auth kontrolü yaptığı için her zaman render edebiliriz
        shouldRender: authData.hasHydrated
    }
}

// Login sayfası için - middleware zaten yönlendirme yapıyor
export const useRequireGuest = () => {
    const authData = useAuth()

    return {
        ...authData,
        // Middleware zaten auth kontrolü yaptığı için her zaman render edebiliriz
        shouldRender: authData.hasHydrated
    }
}