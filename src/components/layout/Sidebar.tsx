'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/constants/routes'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { OrgData } from '@/types/auth'

export function Sidebar() {
  const pathname = usePathname()
  const [isConnected, setIsConnected] = useLocalStorage('github-connected', false)
  const [orgData, setOrgData] = useLocalStorage<OrgData | null>('github-org-data', null)

  const handleConnect = (orgName: string, token: string) => {
    setOrgData({ orgName, token })
    setIsConnected(true)
  }

  const handleLogout = () => {
    setIsConnected(false)
    setOrgData(null)
  }

  return (
    <aside className="w-64 border-r border-gray-200 pt-5 pb-3 flex flex-col">
      <div className="px-5 mb-6">
        <h1 className="text-xl font-bold">GitHubMon</h1>
        <p className="text-xs text-gray-500 mt-1">Organizasyon İzleme Paneli</p>
      </div>
      
      {isConnected && orgData && (
        <div className="px-5 py-3 mb-5">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              🏢
            </div>
            <div className="ml-3">
              <h2 className="font-semibold text-sm">{orgData.orgName}</h2>
              <p className="text-xs text-gray-500">Bağlandı</p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="space-y-1 px-3 flex-grow">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto px-3">
        {!isConnected ? (
          <LoginForm onConnect={handleConnect} />
        ) : (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}