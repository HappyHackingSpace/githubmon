'use client'

import { useTheme } from '@/components/theme/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Moon, Sun, Monitor } from 'lucide-react'


export function ThemeToggle() {
  const {  setTheme, actualTheme } = useTheme()

  const toggleTheme = () => {
    if (actualTheme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}


export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Tema seçin" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center space-x-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}


export function ThemeToggleMinimal() {
  const { actualTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {actualTheme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
        </>
      )}
    </button>
  )
}