'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "Ara..." }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="pl-9"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </div>
    </div>
  )
}