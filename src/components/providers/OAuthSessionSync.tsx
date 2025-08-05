'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'

// Type assertion for extended session
interface ExtendedSession {
  accessToken?: string
  user?: {
    login?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function OAuthSessionSync() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setOrgData, setConnected, setTokenExpiry, isConnected } = useAuthStore()
  const hasProcessedSession = useRef(false)

 useEffect(() => {
    const extendedSession = session as ExtendedSession
    if (status === 'authenticated' && extendedSession?.accessToken && extendedSession?.user && !isConnected && !hasProcessedSession.current) {
      
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30) // 30 days - align with AuthCallback
      setOrgData({
        orgName: extendedSession.user.login || extendedSession.user.name || 'Unknown',
        token: extendedSession.accessToken
      })
      setTokenExpiry(expiryDate.toISOString())
      setConnected(true)
      hasProcessedSession.current = true
      // Redirect to dashboard if we're on login page
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        router.replace('/dashboard')
      }
    }
    // Reset the flag when session is cleared
    if (status === 'unauthenticated') {
      hasProcessedSession.current = false
    }
  }, [session, status, isConnected, setOrgData, setConnected, setTokenExpiry, router])

  return null
}
