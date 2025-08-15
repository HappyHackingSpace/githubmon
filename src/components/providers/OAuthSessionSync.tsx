'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores'
import { cookieUtils } from '@/lib/cookies'

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
