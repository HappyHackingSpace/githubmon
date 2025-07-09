'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePreferencesStore } from '@/stores/appStore'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'dark' | 'light' // System resolved theme
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  actualTheme: 'light'
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system', 
  storageKey = 'ui-theme',
  ...props 
}: ThemeProviderProps) {
  const { theme: zustandTheme, setTheme: setZustandTheme } = usePreferencesStore()
  const [theme, setTheme] = useState<Theme>(zustandTheme || defaultTheme)
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light') 

 
  useEffect(() => {
    setZustandTheme(theme)
  }, [theme, setZustandTheme])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    let resolvedTheme: 'dark' | 'light' = 'light'

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      resolvedTheme = systemTheme
    } else {
      resolvedTheme = theme
    }


    root.classList.add(resolvedTheme)
    setActualTheme(resolvedTheme)
    

    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

 
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light'
      setActualTheme(systemTheme) 
      
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(systemTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => { 
      setTheme(newTheme)
    },
    actualTheme 
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}> 
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}