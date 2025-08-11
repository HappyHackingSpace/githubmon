'use client'

import { useStoreHydration } from '@/stores'

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStoreHydration()


  if (!hasHydrated) {
  return null
}

  return <>{children}</>
}