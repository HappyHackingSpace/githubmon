'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores'
import { cookieUtils } from '@/lib/cookies'

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
  const { setOrgData, setConnected, setTokenExpiry, isConnected } = useAuthStore()

useEffect(() => {
  const handleFocus = () => {
    const authData = cookieUtils.getAuth()
    if (!authData && isConnected) {
      setConnected(false)
      setOrgData(null)
      setTokenExpiry(null)
    }
  }
  
  window.addEventListener('focus', handleFocus)
  return () => window.removeEventListener('focus', handleFocus)
}, [isConnected, setConnected, setOrgData, setTokenExpiry])

  return null
}
