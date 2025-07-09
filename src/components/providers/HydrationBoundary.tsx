'use client'

import { useStoreHydration } from '@/stores/appStore'

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStoreHydration()


  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}