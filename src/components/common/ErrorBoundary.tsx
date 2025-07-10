'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

    render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="m-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Bir hata oluştu</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Sayfa yüklenirken bir sorun meydana geldi.'}
            </p>
            <details className="text-left text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer">Hata detayları</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error?.stack}
              </pre>
            </details>
            <div className="space-x-2">
              <Button onClick={() => this.setState({ hasError: false, error: undefined })}>
                Tekrar Dene
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Sayfayı Yenile
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}