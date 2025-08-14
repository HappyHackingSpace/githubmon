'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKanbanStore } from '@/stores/kanban'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_TEMPLATES = [
  { title: '🐛 Bug Fix', priority: 'high' as const },
  { title: '✨ New Feature', priority: 'medium' as const },
  { title: '📚 Documentation', priority: 'low' as const },
  { title: '👀 Code Review', priority: 'medium' as const },
  { title: '� Refactoring', priority: 'medium' as const },
  { title: '🎨 UI/UX Improvement', priority: 'low' as const }
]

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask } = useKanbanStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const handleClose = useCallback(() => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    onClose()
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      type: 'personal',
      priority,
      labels: []
    })

    handleClose()
  }

  const handleQuickAdd = (template: typeof QUICK_TEMPLATES[0]) => {
    addTask({
      title: template.title,
      description: '',
      type: 'personal',
      priority: template.priority,
      labels: []
    })
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Task Ekle</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hızlı Template'ler */}
          <div>
            <Label className="text-sm font-medium">Hızlı Ekleme</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {QUICK_TEMPLATES.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(template)}
                  className="justify-start text-xs"
                >
                  {template.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Veya özel task</span>
            </div>
          </div>

          {/* Manuel Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task başlığı..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama (opsiyonel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Task açıklaması..."
                rows={3}
              />
            </div>

            <div>
              <Label>Öncelik</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Düşük</SelectItem>
                  <SelectItem value="medium">🟡 Orta</SelectItem>
                  <SelectItem value="high">🟠 Yüksek</SelectItem>
                  <SelectItem value="urgent">🔴 Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                İptal
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Task Ekle
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
