'use client'

import { ThemeToggleMinimal } from '@/components/theme/ThemeToggle'

export function ThemeSection() {
  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
      <ThemeToggleMinimal />
    </div>
  )
}

//Theme toggle section, dark/light mode switcher