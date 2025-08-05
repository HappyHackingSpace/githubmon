'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'

export function OAuthSessionSync() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setOrgData, setConnected, setTokenExpiry, isConnected } = useAuthStore()
  const hasProcessedSession = useRef(false)

 useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && !isConnected && !hasProcessedSession.current) {
      
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30) // 30 days - align with AuthCallback
      setOrgData({
        orgName: session.user.login || session.user.name || 'Unknown',
        token: session.accessToken
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
