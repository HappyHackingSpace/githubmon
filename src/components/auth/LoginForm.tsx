import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface LoginFormProps {
  onConnect: (orgName: string, token: string) => void
}

export function LoginForm({ onConnect }: LoginFormProps) {
  const [orgName, setOrgName] = useState('')
  const [token, setToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orgName.trim()) {
      onConnect(orgName.trim(), token.trim())
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">GitHub'a Bağlan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Organizasyon adı"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="GitHub API Token (opsiyonel)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Bağlan
          </Button>
        </form>
        <p className="mt-2 text-xs text-gray-500 text-center">
          Token güvenli bir şekilde sadece tarayıcınızda saklanır.
        </p>
      </CardContent>
    </Card>
  )
}