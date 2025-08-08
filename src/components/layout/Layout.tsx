'use client'


import { Sidebar } from './Sidebar'
import { useSidebarState } from '@/stores'
import { SidebarToggle } from './SidebarToggle'

export function Layout({ children }: { children: React.ReactNode }) {
  const { setOpen } = useSidebarState()

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute left-0 top-0 h-full z-10">
        <Sidebar />
        <SidebarToggle onClick={() => setOpen(true)} />
      </div>
      <main className="lg:ml-64 ml-0 h-full overflow-auto">
        {children}
      </main>
    </div>
  )
}