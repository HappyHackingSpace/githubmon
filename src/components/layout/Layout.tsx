'use client'


import { Sidebar, SidebarToggle } from './Sidebar'
import { useSidebarState } from '@/stores'

export function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, setOpen } = useSidebarState()

  return (
    <div className="flex">
      <Sidebar />
      <SidebarToggle onClick={() => setOpen(true)} />

       <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}