'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'

export default function AuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()  
  const { setOrgData, setConnected, setTokenExpiry } = useAuthStore()

useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && session.user) {
      try {
        // Set auth data from OAuth session
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30) // 30 days - more conservative
        setOrgData({
          orgName: session.user.login || session.user.name || 'Unknown',
          token: session.accessToken
        })
        setTokenExpiry(expiryDate.toISOString())
        setConnected(true)
        router.replace('/dashboard')
      } catch (error) {
        console.error('Failed to set auth data:', error)
        router.replace('/')
      }
    } else if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [session, status, router, setOrgData, setConnected, setTokenExpiry])

  return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {status === 'loading' ? 'Authenticating with GitHub...' : 'Completing authentication...'}
        </p>
      </div>
    </div>
  )
}

