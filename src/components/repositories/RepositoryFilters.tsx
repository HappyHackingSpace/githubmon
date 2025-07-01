'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface RepositoryFiltersProps {
  onFilterChange: (filter: string) => void
  currentFilter: string
}

export function RepositoryFilters({ onFilterChange, currentFilter }: RepositoryFiltersProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select value={currentFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtre seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Repolar</SelectItem>
          <SelectItem value="updated">Son Güncellenenler</SelectItem>
          <SelectItem value="stars">En Çok Yıldızlananlar</SelectItem>
          <SelectItem value="forks">En Çok Forklananlar</SelectItem>
          <SelectItem value="issues">Aktif Issues</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}