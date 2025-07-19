// hooks/useAuth.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useStoreHydration } from '@/stores'

export const useAuth = (redirectTo?: string) => {
    const router = useRouter()
    const hasHydrated = useStoreHydration()
    const { isConnected, orgData, isTokenValid, logout } = useAuthStore()

    const isAuthenticated = hasHydrated && isConnected && orgData && isTokenValid()

    useEffect(() => {
        if (hasHydrated && !isAuthenticated && redirectTo) {
            router.replace(redirectTo) // replace kullanarak history'yi temizle
        }
    }, [hasHydrated, isAuthenticated, redirectTo, router])

    return {
        isAuthenticated,
        hasHydrated,
        isConnected,
        orgData,
        logout,
        isLoading: !hasHydrated,
        shouldRedirect: hasHydrated && !isAuthenticated && !!redirectTo
    }
}

// Auth gerektiren sayfalar için (login olmamış kullanıcıları yönlendir)
export const useRequireAuth = (redirectTo: string = '/login') => {
    const authData = useAuth(redirectTo)

    // Eğer hydrate olmuş ve authenticated değilse, hiçbir şey render etme
    if (authData.shouldRedirect) {
        return {
            ...authData,
            shouldRender: false
        }
    }

    return {
        ...authData,
        shouldRender: authData.hasHydrated
    }
}

export const useRequireGuest = (redirectTo: string = '/dashboard') => {
    const router = useRouter()
    const hasHydrated = useStoreHydration()
    const { isConnected, orgData, isTokenValid, logout } = useAuthStore()

    const isAuthenticated = hasHydrated && isConnected && orgData && isTokenValid()

    useEffect(() => {
        if (hasHydrated && isAuthenticated) {
            router.replace(redirectTo)
        }
    }, [hasHydrated, isAuthenticated, redirectTo, router])

    return {
        isAuthenticated,
        hasHydrated,
        isConnected,
        orgData,
        logout,
        isLoading: !hasHydrated,
        shouldRedirect: hasHydrated && isAuthenticated,
        shouldRender: hasHydrated && !isAuthenticated
    }