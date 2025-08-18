import { OrgData } from '@/types/auth'

export interface AuthCookieData {
    isConnected: boolean
    orgData: OrgData | null
    tokenExpiry: string | null
}

// Cookie utility functions
export const cookieUtils = {
    set: (name: string, value: string, days: number = 7) => {
        if (typeof document === 'undefined') return

        const expires = new Date()
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

        const attributes = [
            `${name}=${encodeURIComponent(value)}`,
            `expires=${expires.toUTCString()}`,
            `path=/`,
            `SameSite=Strict`
        ]

        if (location.protocol === 'https:') {
            attributes.push('Secure')
        }

        document.cookie = attributes.join('; ')
        
    },

    get: (name: string): string | null => {
        if (typeof document === 'undefined') return null

        const nameEQ = name + '='
        const ca = document.cookie.split(';')

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') c = c.substring(1, c.length)
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length))
            }
        }
        return null
    },

    remove: (name: string) => {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
    },

    setAuth: (data: AuthCookieData) => {
        cookieUtils.set('githubmon-auth', JSON.stringify(data), 30) 
    },

    getAuth: (): AuthCookieData | null => {
        const authCookie = cookieUtils.get('githubmon-auth')
        if (!authCookie) return null

        try {
            return JSON.parse(authCookie)
        } catch {
            return null
        }
    },

    removeAuth: () => {
        cookieUtils.remove('githubmon-auth')
    }
}
