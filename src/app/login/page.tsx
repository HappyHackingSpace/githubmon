'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useAuthStore } from '@/stores'
import { useRequireGuest } from '@/hooks/useAuth'

export default function LoginPage() {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { shouldRender } = useRequireGuest()
  const { setOrgData, setConnected, setTokenExpiry } = useAuthStore()

  // Auth kontrolü - giriş yapmış kullanıcıyı dashboard'a yönlendir
  if (!shouldRender) {
    return null
  }

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
        throw new Error('Invalid token. Please check your token.')
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
      setError(err instanceof Error ? err.message : 'An error occurred')
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
    <div className="h-screen bg-background flex items-center justify-center p-3">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 h-full max-h-[95vh]">

        {/* Left Column - Token Guide */}
        <Card className="shadow-xl flex flex-col overflow-hidden">
          <CardHeader className="text-center pb-3 border-b">
            <h1 className="text-2xl font-bold text-foreground mb-1">GitHubMon</h1>
            <p className="text-sm text-muted-foreground">GitHub organization analytics</p>
          </CardHeader>

          <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Rate Limits */}
            <div>
              <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Why GitHub Token?
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-center p-2 border rounded">
                  <div className="text-xs text-muted-foreground mb-1">Without</div>
                  <Badge variant="destructive" className="text-xs">60/hour</Badge>
                </div>
                <div className="text-center p-2 border rounded">
                  <div className="text-xs text-muted-foreground mb-1">With</div>
                  <Badge variant="default" className="text-xs">5,000/hour</Badge>
                </div>
              </div>
            </div>

            {/* How to Get Token */}
            <div>
              <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Get Token Steps
              </h2>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 p-2 bg-muted/30 rounded">
                  <div className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-sm">GitHub Settings</p>
                    <p className="text-xs text-muted-foreground">Developer settings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-2 bg-muted/30 rounded">
                  <div className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-sm">Generate token</p>
                    <p className="text-xs text-muted-foreground">Use "classic" option</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-2 bg-muted/30 rounded">
                  <div className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-sm">Select permissions</p>
                    <div className="text-xs text-muted-foreground">
                      ✅ <code className="bg-background px-1 rounded">repo</code> & <code className="bg-background px-1 rounded">user</code>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                >
                  Create Token →
                </a>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                <span>🔒</span>
                Security
              </h2>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Browser only
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Not sent to servers
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Auto-delete (1 month)
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Logout anytime
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Login Form */}
        <Card className="shadow-xl flex flex-col">
          <CardHeader className="text-center pb-3 border-b">
            <CardTitle className="text-xl font-bold">Login with GitHub Token</CardTitle>
            <p className="text-muted-foreground text-sm">Enter your personal access token</p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-center p-4">
            <div className="max-w-md mx-auto w-full space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    GitHub Personal Access Token
                  </label>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="font-mono text-sm h-10"
                  />
                  {error && (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold"
                  disabled={isLoading || !token.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-background text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={continueWithoutToken}
                className="w-full h-10"
              >
                <span className="font-semibold">Continue Without Token</span>
                <Badge variant="secondary" className="ml-2 text-xs">Limited</Badge>
              </Button>

              <div className="text-center pt-3">
                <p className="text-sm text-muted-foreground">
                  Already have an account? Enter your token above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}