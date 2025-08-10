'use client'

import { useEffect } from 'react'
import { useAuthStore, useActionItemsStore } from '@/stores'
import { useQuickWinsStore } from '@/stores/quickWins'

export function DataInitializer() {
  const { isConnected, orgData, isTokenValid } = useAuthStore()
  const { refreshData } = useActionItemsStore()
  const { fetchGoodIssues, fetchEasyFixes } = useQuickWinsStore()

  useEffect(() => {
    if (isConnected && orgData && isTokenValid()) {
      refreshData()
      
      fetchGoodIssues()
      fetchEasyFixes()
    }
  }, [isConnected, orgData, isTokenValid, refreshData, fetchGoodIssues, fetchEasyFixes])

  return null
}
