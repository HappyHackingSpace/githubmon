'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore, usePreferencesStore } from '@/stores/app'
import { ThemeSelector, ThemeToggle } from '@/components/theme/ThemeToggle'

export default function SettingsPage() {
  const { orgData, setOrgData } = useAuthStore()
  const { resetPreferences } = usePreferencesStore()
  const [tempOrgName, setTempOrgName] = useState(orgData?.orgName || '')
  const [tempToken, setTempToken] = useState('')

  const handleClearData = () => {
    if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
      resetPreferences()
  
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Ayarlar</h2>
        
        <div className="space-y-6">
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
              
              <div>
                <label className="block text-sm font-medium mb-2">API Token (Opsiyonel)</label>
                <Input
                  type="password"
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  placeholder="Mevcut token'ı değiştirmek için girin"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Token olmadan da çalışır, ancak rate limit düşük olur.
                </p>
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