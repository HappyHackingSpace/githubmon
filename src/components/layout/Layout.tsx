'use client'


import { Sidebar, SidebarToggle } from './Sidebar'
import { useSidebarState } from '@/stores'

export function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, setOpen } = useSidebarState()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <SidebarToggle onClick={() => setOpen(true)} />
      
      <main className="flex-1 overflow-y-auto lg:ml-0">
        {children}
      </main>
    </div>
  )
}