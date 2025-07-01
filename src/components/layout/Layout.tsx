import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}