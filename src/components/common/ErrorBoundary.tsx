'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Bir hata oluştu</h2>
            <p className="text-gray-600 mb-4">Sayfa yüklenirken bir sorun meydana geldi.</p>
            <Button onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}