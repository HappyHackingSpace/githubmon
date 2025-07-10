'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useAuthStore } from '@/stores'

export default function LoginPage() {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setOrgData, setConnected, setTokenExpiry } = useAuthStore()
 



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
   
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error('Geçersiz token. Lütfen token\'ınızı kontrol edin.')
      }

      const userData = await response.json()
      

      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1) 
      
     setOrgData({ 
  orgName: userData.login, 
  token: token.trim() 
})
setTokenExpiry(expiryDate.toISOString())
setConnected(true)
    
      router.push('/dashboard')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

 const continueWithoutToken = () => {
  setOrgData({ orgName: 'guest', token: '' })
  setConnected(true)
  router.push('/dashboard')
}

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sol Kolon - Token Guide */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">GitHubMon</h1>
            <p className="text-muted-foreground">GitHub organizasyonlarını analiz etmek için güçlü bir platform</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🚀 GitHub Token Neden Gerekli?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Token olmadan</span>
                <Badge variant="destructive">60 istek/saat</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Token ile</span>
                <Badge variant="default">5,000 istek/saat</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Daha fazla veri çekebilmek ve rate limit'e takılmamak için GitHub token'ınızı kullanın.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📝 Token Nasıl Alınır?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">1</span>
                  <div>
                    <p className="font-medium">GitHub'a git</p>
                    <p className="text-sm text-gray-600">Settings → Developer settings → Personal access tokens</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">2</span>
                  <div>
                    <p className="font-medium">Yeni token oluştur</p>
                    <p className="text-sm text-gray-600">"Generate new token (classic)" seçeneğini kullan</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">3</span>
                  <div>
                    <p className="font-medium">Gerekli izinleri seç</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>✅ <code className="bg-gray-100 px-1 rounded">repo</code> (genel repolar için)</div>
                      <div>✅ <code className="bg-gray-100 px-1 rounded">user</code> (kullanıcı bilgileri için)</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">4</span>
                  <div>
                    <p className="font-medium">Token'ı kopyala</p>
                    <p className="text-sm text-gray-600">Token'ı güvenli bir yerde sakla - sadece bir kez gösterilir</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  GitHub Token Oluştur →
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 Güvenlik</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Token'ınız sadece tarayıcınızda saklanır</li>
                <li>• Sunucularımıza gönderilmez</li>
                <li>• 1 ay sonra otomatik olarak silinir</li>
                <li>• İstediğiniz zaman çıkış yapabilirsiniz</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>GitHub Token ile Giriş</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    GitHub Personal Access Token
                  </label>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="font-mono text-sm"
                  />
                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !token.trim()}
                >
                  {isLoading ? 'Doğrulanıyor...' : 'Giriş Yap'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">veya</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={continueWithoutToken}
                  className="w-full mt-4"
                >
                  Token Olmadan Devam Et
                  <span className="ml-2 text-xs text-gray-500">(Sınırlı)</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Zaten hesabınız var mı? Token'ınızı yukarıda girin.</p>
          </div>
        </div>
      </div>
    </div>
  )
}