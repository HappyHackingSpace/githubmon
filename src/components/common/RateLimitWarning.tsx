'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDataCacheStore, useAuthStore } from '@/stores/appStore'

export function RateLimitWarning() {
  const { rateLimitInfo, setRateLimit } = useDataCacheStore()
  const { orgData } = useAuthStore()
  const [timeUntilReset, setTimeUntilReset] = useState('')
  
  const hasToken = orgData?.token && orgData.token.length > 0


  useEffect(() => {
    if (!rateLimitInfo) {
      setRateLimit({
        remaining: hasToken ? 5000 : 60,
        limit: hasToken ? 5000 : 60,
        resetTime: Date.now() + 3600000, // 1 hour
        used: 0
      })
    }
  }, [rateLimitInfo, setRateLimit, hasToken])


  useEffect(() => {
    if (!rateLimitInfo) return

    const updateTimer = () => {
      const now = Date.now()
      const resetTime = rateLimitInfo.resetTime
      
      if (now >= resetTime) {
     
        const newLimit = hasToken ? 5000 : 60
        setRateLimit({
          remaining: newLimit,
          limit: newLimit,
          resetTime: now + 3600000,
          used: 0
        })
        setTimeUntilReset('')
        return
      }

      const timeDiff = resetTime - now
      const minutes = Math.floor(timeDiff / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
      
      if (minutes > 0) {
        setTimeUntilReset(`${minutes}m`)
      } else {
        setTimeUntilReset(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [rateLimitInfo, hasToken, setRateLimit])


  useEffect(() => {
    const updateFromHeaders = (headers: Headers) => {
      const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0')
      const limit = parseInt(headers.get('x-ratelimit-limit') || '60')
      const resetTime = parseInt(headers.get('x-ratelimit-reset') || '0') * 1000
      const used = parseInt(headers.get('x-ratelimit-used') || '0')

      setRateLimit({ remaining, limit, resetTime, used })
    }

    // @ts-ignore - Global function for API client
    window.updateRateLimit = updateFromHeaders
  }, [setRateLimit])

  if (!rateLimitInfo) {
    return null 
  }

  const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100
  const isLow = percentage < 20
  const isCritical = rateLimitInfo.remaining === 0


  if (!isLow && !isCritical) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          {rateLimitInfo.remaining}/{rateLimitInfo.limit}
        </Badge>
        {!hasToken && (
          <span className="text-xs text-muted-foreground">API</span>
        )}
      </div>
    )
  }

 
  const getVariant = () => {
    if (isCritical) return 'destructive'
    if (isLow) return 'secondary'
    return 'outline'
  }

  const getStatus = () => {
    if (isCritical) return 'Limit Doldu'
    if (percentage < 10) return 'Kritik'
    return 'Düşük'
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={getVariant()} className="text-xs">
        {rateLimitInfo.remaining}/{rateLimitInfo.limit}
      </Badge>
      
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        {timeUntilReset && <span>{timeUntilReset}</span>}
        {isLow && <span>•</span>}
        {isLow && <span>{getStatus()}</span>}
      </div>

      {/* Critical state: Show action button */}
      {(isCritical || (isLow && !hasToken)) && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.location.href = '/login'}
          className="text-xs h-6 px-2"
        >
          {isCritical ? 'Token Ekle' : '+Token'}
        </Button>
      )}
    </div>
  )
}