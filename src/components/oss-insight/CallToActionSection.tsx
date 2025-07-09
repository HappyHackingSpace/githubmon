'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export function CallToActionSection() {
  const router = useRouter()

  return (
    <section className="text-center py-12">
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">Daha Fazla Analiz İstiyorsanız</h3>
          <p className="text-lg mb-6">
            GitHub token'ınızla giriş yapın ve organizasyonunuzu detaylı analiz edin
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            GitHub ile Giriş Yap
          </button>
        </CardContent>
      </Card>
    </section>
  )
}

// Global yorum: Login sayfasına yönlendiren CTA section