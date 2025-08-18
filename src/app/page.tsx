'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { useAuthStore, useStoreHydration } from '@/stores'
import { SearchModal } from '@/components/search/SearchModal'
import { CallToActionSection } from '@/components/CallToActionSection'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  const router = useRouter()
  const hasHydrated = useStoreHydration()
  const { isConnected, orgData, isTokenValid, hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (hasHydrated && isConnected && orgData && isTokenValid()) {
      // Small delay to ensure middleware doesn't conflict
      setTimeout(() => {
        router.replace('/dashboard')
      }, 100)
      return
    }
  }, [hasHydrated, isConnected, orgData, isTokenValid, router])

  if (hasHydrated && isConnected && orgData && isTokenValid()) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
              GitHub Analytics
              <span className="text-indigo-600 dark:text-indigo-400 block">
                Made Simple
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Monitor your GitHub repositories, track trends, and analyze performance
              with powerful insights and beautiful visualizations.
            </p>
          </div>
        </div>

     
     

      

        <Separator />

      
         </main>

      <CallToActionSection />
      <SearchModal />
      <Footer />
    </>
  )
}