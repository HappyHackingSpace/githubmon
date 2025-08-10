'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePreferencesStore } from '@/stores'
import { useRequireAuth } from '@/hooks/useAuth'
import { ThemeSelector } from '@/components/theme/ThemeToggle'
// import { GitHubTokenSetup } from '@/components/common/GitHubTokenSetup'
import { cookieUtils } from '@/lib/cookies'

export default function SettingsPage() {
  const { isLoading, orgData } = useRequireAuth()
  const { resetPreferences } = usePreferencesStore()
  const [tempOrgName, setTempOrgName] = useState(orgData?.orgName || '')

  const handleClearData = () => {
    if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
      resetPreferences()
      cookieUtils.removeAuth()
      localStorage.clear()
      window.location.reload()
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Ayarlar</h2>

        <div className="space-y-8">

          {/* GitHub API Token Setup */}
          <section>
            <h3 className="text-lg font-medium mb-4">🔑 GitHub API Token</h3>
            {/* <GitHubTokenSetup /> */}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>GitHub Bağlantısı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organizasyon/Kullanıcı Adı</label>
                <Input
                  value={tempOrgName}
                  onChange={(e) => setTempOrgName(e.target.value)}
                  placeholder="örnek: microsoft, facebook"
                />
              </div>

              <Button>
                Kaydet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 Görünüm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tema</label>
                <ThemeSelector />
                <p className="text-xs text-gray-500 mt-1">
                  Sistem temasını takip edebilir veya manuel seçim yapabilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Veri Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Tüm yerel verilerinizi temizleyebilirsiniz.
                </p>
                <Button variant="destructive" onClick={handleClearData}>
                  Tüm Verileri Temizle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}