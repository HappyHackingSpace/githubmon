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
  columnId: string | null
}




export function AddTaskModal({ isOpen, onClose, columnId }: AddTaskModalProps) {
  const { addTask } = useKanbanStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const handleClose = useCallback(() => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    onClose();
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      type: 'personal',
      priority,
      labels: [],
      columnId
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Task description..."
              rows={3}
            />
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
