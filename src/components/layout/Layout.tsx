'use client'

import { useState } from 'react'
import { Sidebar, SidebarToggle } from './Sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SidebarToggle onClick={() => setSidebarOpen(true)} />
      
      <main className="flex-1 overflow-y-auto lg:ml-0">
        {children}
      </main>
    </div>
  )
}