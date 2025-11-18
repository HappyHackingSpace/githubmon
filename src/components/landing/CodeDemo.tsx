"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

const codeSnippet = `{
  "repository": "react",
  "stars": 228000,
  "forks": 46000,
  "contributors": 1500,
  "activity": "high",
  "trends": {
    "commits": "+15%",
    "prs": "+8%",
    "issues": "-12%"
  }
}`

export function CodeDemo() {
  const [displayedCode, setDisplayedCode] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < codeSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(prev => prev + codeSnippet[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30)
      return () => clearTimeout(timeout)
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayedCode("")
        setCurrentIndex(0)
      }, 3000)
      return () => clearTimeout(resetTimeout)
    }
  }, [currentIndex])

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Developer-First Experience
          </h2>
          <p className="text-lg text-muted-foreground">
            Access powerful analytics through elegant APIs
          </p>
        </div>

        <Card className="bg-black/95 backdrop-blur-sm border-border/20 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-4 text-xs text-gray-400 font-mono">analytics.json</span>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="text-gray-500 text-sm font-mono select-none">$</span>
              <div className="flex-1">
                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                  <code>
                    {displayedCode}
                    <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-0.5" />
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-indigo-500 mb-2">5K+</div>
            <div className="text-sm text-muted-foreground">API Calls/Day</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-purple-500 mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-pink-500 mb-2">&lt;100ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
