'use client'


import { Sidebar, SidebarToggle } from './Sidebar'
import { useSidebarState } from '@/stores'

export function Layout({ children }: { children: React.ReactNode }) {
  const { setOpen } = useSidebarState()

  return (
    <div className="flex">
      <Sidebar />
      <SidebarToggle onClick={() => setOpen(true)} />
      <main className="flex-1 min-h-screen lg:ml-80  max-w-7xl mx-auto p-6 space-y-6 overflow-hidden">
        {children}
      </main>
    </div>
  )
}