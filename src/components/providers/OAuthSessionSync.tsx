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
    // Only sync if we have a session but no local auth data and haven't processed this session yet
    if (status === 'authenticated' && session?.accessToken && !isConnected && !hasProcessedSession.current) {
      console.log('Syncing OAuth session to auth store')
      
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 90) // 90 days

      setOrgData({
        orgName: session.user.login || session.user.name || 'Unknown',
        token: session.accessToken
      })
      setTokenExpiry(expiryDate.toISOString())
      setConnected(true)
      hasProcessedSession.current = true

      // Redirect to dashboard if we're on login page
      if (window.location.pathname === '/login') {
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
