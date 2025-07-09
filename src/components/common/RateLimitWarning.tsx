'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { OrgData } from '@/types/auth'

interface RateLimitInfo {
  remaining: number
  limit: number
  resetTime: number
  used: number
}

export function RateLimitWarning() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    remaining: 60,
    limit: 60,
    resetTime: Date.now() + 3600000, // 1 saat sonra
    used: 0
  })
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  
  const [orgData] = useLocalStorage<OrgData | null>('github-org-data', null)
  const hasToken = orgData?.token && orgData.token.length > 0

  useEffect(() => {
    // Rate limit bilgilerini localStorage'dan oku
    const savedRateLimit = localStorage.getItem('github-rate-limit')
    if (savedRateLimit) {
      const parsed = JSON.parse(savedRateLimit)
      setRateLimitInfo(parsed)
    }

    // Her dakika güncelle
    const interval = setInterval(updateTimeUntilReset, 60000)
    updateTimeUntilReset()

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Rate limit %20'nin altındaysa uyarı göster
    const warningThreshold = hasToken ? 1000 : 12 // Token ile 1000, tokensiz 12
    setShowWarning(rateLimitInfo.remaining < warningThreshold)
  }, [rateLimitInfo.remaining, hasToken])

  const updateTimeUntilReset = () => {
    const now = Date.now()
    const resetTime = rateLimitInfo.resetTime
    
    if (now >= resetTime) {
      // Reset zamanı geçtiyse rate limit'i sıfırla
      const newLimit = hasToken ? 5000 : 60
      setRateLimitInfo(prev => ({
        ...prev,
        remaining: newLimit,
        limit: newLimit,
        resetTime: now + 3600000,
        used: 0
      }))
      setTimeUntilReset('')
      return
    }

    const timeDiff = resetTime - now
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
    
    setTimeUntilReset(`${minutes}:${seconds.toString().padStart(2, '0')}`)
  }

  // API çağrısı sonrası rate limit güncelleme fonksiyonu
  const updateRateLimit = (headers: Headers) => {
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0')
    const limit = parseInt(headers.get('x-ratelimit-limit') || '60')
    const resetTime = parseInt(headers.get('x-ratelimit-reset') || '0') * 1000
    const used = parseInt(headers.get('x-ratelimit-used') || '0')

    const newRateLimit = { remaining, limit, resetTime, used }
    setRateLimitInfo(newRateLimit)
    
    // localStorage'a kaydet
    localStorage.setItem('github-rate-limit', JSON.stringify(newRateLimit))
  }

  // Global olarak kullanılabilir hale getir
  useEffect(() => {
    // @ts-ignore
    window.updateRateLimit = updateRateLimit
  }, [])

  const getRateLimitColor = () => {
    const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100
    if (percentage < 20) return 'destructive'
    if (percentage < 50) return 'secondary'
    return 'default'
  }

  const getRateLimitStatus = () => {
    if (rateLimitInfo.remaining === 0) return 'Limit Doldu'
    if (rateLimitInfo.remaining < 10) return 'Kritik'
    if (rateLimitInfo.remaining < 100 && hasToken) return 'Düşük'
    if (rateLimitInfo.remaining < 20 && !hasToken) return 'Düşük'
    return 'Normal'
  }

  if (!showWarning && rateLimitInfo.remaining > 0) {
    // Sadece küçük badge göster
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={getRateLimitColor()}>
          {rateLimitInfo.remaining}/{rateLimitInfo.limit}
        </Badge>
        {!hasToken && (
          <span className="text-xs text-gray-500">API Limit</span>
        )}
      </div>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {rateLimitInfo.remaining === 0 ? '🚫' : '⚠️'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-orange-800">
                GitHub API Rate Limit
              </h4>
              <Badge variant={getRateLimitColor()}>
                {getRateLimitStatus()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Kalan İstek:</span>
                <span className="font-medium">{rateLimitInfo.remaining}/{rateLimitInfo.limit}</span>
              </div>
              
              {timeUntilReset && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Sıfırlanma:</span>
                  <span className="font-medium">{timeUntilReset}</span>
                </div>
              )}
              
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(rateLimitInfo.remaining / rateLimitInfo.limit) * 100}%` }}
                />
              </div>
            </div>
            
            {!hasToken && rateLimitInfo.remaining < 30 && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-sm text-orange-700 mb-3">
                  Rate limit düşük! Daha fazla istek için GitHub token'ı ekleyin.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/login'}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Token Ekle (5,000 istek/saat)
                </Button>
              </div>
            )}
            
            {rateLimitInfo.remaining === 0 && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-sm text-orange-700 mb-3">
                  Rate limit doldu! {timeUntilReset} sonra yeniden deneyin.
                </p>
                {!hasToken && (
                  <Button 
                    size="sm" 
                    onClick={() => window.location.href = '/login'}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Token ile Hemen Devam Et
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}