import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useSettingsStore } from './settings'
import { useActionItemsStore } from './actionItems'
import type { ActionItem, AssignedItem, MentionItem, StalePR } from './actionItems'

export interface KanbanTask {
  id: string
  title: string
  description?: string
  type: 'github-issue' | 'github-pr' | 'personal'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  githubUrl?: string
  labels: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  taskIds: string[]
}

interface KanbanState {
  tasks: Record<string, KanbanTask>
  columns: Record<string, KanbanColumn>
  columnOrder: string[]
  
  syncFromGitHub: () => Promise<number>
  addTask: (task: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<KanbanTask>) => void
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void
  deleteTask: (taskId: string) => void
  clearGitHubTasks: () => void
  addColumn: (title: string, color: string) => void
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => void
  deleteColumn: (id: string) => void
  reorderColumns: (newOrder: string[]) => void
}

const defaultColumns: Record<string, KanbanColumn> = {
  'todo': {
    id: 'todo',
    title: 'To Do',
    color: '#ef4444',
    taskIds: []
  },
  'in-progress': {
    id: 'in-progress',
    title: 'In Progress',
    color: '#f59e0b',
    taskIds: []
  },
  'review': {
    id: 'review',
    title: 'Review',
    color: '#8b5cf6',
    taskIds: []
  },
  'done': {
    id: 'done',
    title: 'Done',
    color: '#10b981',
    taskIds: []
  }
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      tasks: {},
      columns: defaultColumns,
      columnOrder: ['todo', 'in-progress', 'review', 'done'],

      syncFromGitHub: async () => {
        const { githubSettings } = useSettingsStore.getState()
        const { assignedItems, mentionItems, staleItems } = useActionItemsStore.getState()
        
        console.log('🔄 Syncing Action Required data to kanban...')
        console.log('⚙️ GitHub Settings:', githubSettings)
        
        const selectedItems: ActionItem[] = []
        
        // Determine which action items to include based on settings
        if (githubSettings.assignedToMe) {
          console.log(`📌 Adding assigned items: ${assignedItems.length} items`)
          selectedItems.push(...assignedItems)
        }
        
        if (githubSettings.mentionsMe) {
          console.log(`💬 Adding mention items: ${mentionItems.length} items`)
          selectedItems.push(...mentionItems)
        }
        
        if (githubSettings.reviewRequestedFromMe) {
          const reviewRequests = mentionItems.filter(item => 
            'mentionType' in item && item.mentionType === 'review_request'
          )
          console.log(`👀 Adding review request items: ${reviewRequests.length} items`)
          // Review requests are already in mentionItems, don't add them again
        }
        
        console.log(`📋 Total ${selectedItems.length} action items found`)
        
        if (selectedItems.length === 0) {
          console.log('⚠️ No action items found!')
          return 0
        }
        
        // Apply repository filter
        let filteredItems = selectedItems
        if (githubSettings.repositories.length > 0) {
          filteredItems = selectedItems.filter(item => 
            githubSettings.repositories.some(repo => {
              const itemRepo = item.repo || ''
              const match = itemRepo.toLowerCase().includes(repo.toLowerCase()) ||
                           itemRepo.includes(repo)
              if (match) {
                console.log(`✅ Repo match: ${itemRepo} contains ${repo}`)
              }
              return match
            })
          )
          console.log(`🔍 After repo filter: ${filteredItems.length} items`)
        } else {
          console.log('📦 No repository filter, accepting all items')
        }
        
        // Label filter (optional - action items may not have label info)
        if (githubSettings.labels.length > 0) {
          // Action items may not have labels field, so skip for now
          console.log('🏷️ Label filter not applied for Action Required items')
        }
        
        const newTasks: KanbanTask[] = filteredItems.map((item: ActionItem) => ({
          id: `action-${item.id}`,
          title: item.title,
          type: item.type === 'pullRequest' ? 'github-pr' as const : 'github-issue' as const,
          priority: item.priority || 'medium' as const,
          githubUrl: item.url,
          labels: [],
          description: `${item.repo} - ${item.type}`,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
        
        console.log(`✅ ${newTasks.length} tasks to process:`)
        newTasks.forEach(task => {
          console.log(`  - ${task.title} (${task.type})`)
        })
        
        set(state => {
          const personalTasks = Object.values(state.tasks)
            .filter(t => t.type === 'personal')
            .reduce((acc, task) => {
              acc[task.id] = task
              return acc
            }, {} as Record<string, KanbanTask>)
          
          // GitHub task'larını ID'ye göre güncelle, yeni olanları ekle
          const existingTasks = { ...state.tasks }
          const updatedGitHubTasks: Record<string, KanbanTask> = {}
          
          newTasks.forEach(task => {
            updatedGitHubTasks[task.id] = task
            if (existingTasks[task.id]) {
              // Mevcut task'ı güncelle ama pozisyonunu koru
              existingTasks[task.id] = { ...existingTasks[task.id], ...task }
            } else {
              // Yeni task ekle
              existingTasks[task.id] = task
            }
          })
          
          // Remove deleted GitHub tasks (those starting with action-)
          const newGitHubTaskIds = new Set(newTasks.map(t => t.id))
          Object.keys(existingTasks).forEach(taskId => {
            const task = existingTasks[taskId]
            if (task.type !== 'personal' && taskId.startsWith('action-') && !newGitHubTaskIds.has(taskId)) {
              delete existingTasks[taskId]
            }
          })
          
          // Update task IDs in columns
          const updatedColumns = { ...state.columns }
          Object.keys(updatedColumns).forEach(columnId => {
            updatedColumns[columnId] = {
              ...updatedColumns[columnId],
              taskIds: updatedColumns[columnId].taskIds.filter(taskId => existingTasks[taskId])
            }
          })
          
          // Add new GitHub tasks only to todo column (if they're not elsewhere)
          const allColumnTaskIds = new Set(
            Object.values(updatedColumns).flatMap(col => col.taskIds)
          )
          
          const newTasksToAdd = newTasks.filter(task => !allColumnTaskIds.has(task.id))
          
          if (newTasksToAdd.length > 0) {
            updatedColumns.todo = {
              ...updatedColumns.todo,
              taskIds: [...updatedColumns.todo.taskIds, ...newTasksToAdd.map(t => t.id)]
            }
          }
          
          return {
            tasks: existingTasks,
            columns: updatedColumns
          }
        })
        
        return newTasks.length // Return how many tasks were added
      },

      addTask: (taskData) => {
        const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const task: KanbanTask = {
          ...taskData,
          id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set((state) => ({
          tasks: { ...state.tasks, [id]: task },
          columns: {
            ...state.columns,
            todo: {
              ...state.columns.todo,
              taskIds: [...state.columns.todo.taskIds, id]
            }
          }
        }))
      },

      moveTask: (taskId, fromColumnId, toColumnId, newIndex) => {
        set((state) => {
          const fromColumn = state.columns[fromColumnId]
          const toColumn = state.columns[toColumnId]
          
          const fromTaskIds = [...fromColumn.taskIds]
          const toTaskIds = fromColumnId === toColumnId ? fromTaskIds : [...toColumn.taskIds]
          
          const taskIndex = fromTaskIds.indexOf(taskId)
          fromTaskIds.splice(taskIndex, 1)
          
          toTaskIds.splice(newIndex, 0, taskId)
          
          return {
            columns: {
              ...state.columns,
              [fromColumnId]: {
                ...fromColumn,
                taskIds: fromTaskIds
              },
              [toColumnId]: {
                ...toColumn,
                taskIds: toTaskIds
              }
            }
          }
        })
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              ...updates,
              updatedAt: new Date()
            }
          }
        }))
      },

      deleteTask: (taskId) => {
        set((state) => {
          const newTasks = { ...state.tasks }
          delete newTasks[taskId]
          
          const newColumns = { ...state.columns }
          Object.keys(newColumns).forEach(columnId => {
            newColumns[columnId] = {
              ...newColumns[columnId],
              taskIds: newColumns[columnId].taskIds.filter(id => id !== taskId)
            }
          })
          
          return {
            tasks: newTasks,
            columns: newColumns
          }
        })
      },

      clearGitHubTasks: () => {
        set((state) => {
          const personalTasks = Object.values(state.tasks)
            .filter(t => t.type === 'personal')
            .reduce((acc, task) => {
              acc[task.id] = task
              return acc
            }, {} as Record<string, KanbanTask>)
          
          const personalTaskIds = Object.keys(personalTasks)
          const newColumns = { ...state.columns }
          
          Object.keys(newColumns).forEach(columnId => {
            newColumns[columnId] = {
              ...newColumns[columnId],
              taskIds: newColumns[columnId].taskIds.filter(taskId => personalTaskIds.includes(taskId))
            }
          })
          
          return {
            tasks: personalTasks,
            columns: newColumns
          }
        })
      },

      addColumn: (title, color) => {
        const id = `column-${Date.now()}`
        set((state) => ({
          columns: {
            ...state.columns,
            [id]: {
              id,
              title,
              color,
              taskIds: []
            }
          }
        }))
      },

      updateColumn: (id, updates) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [id]: {
              ...state.columns[id],
              ...updates
            }
          }
        }))
      },

      deleteColumn: (id) => {
        set((state) => {
          const newColumns = { ...state.columns }
          delete newColumns[id]
          return {
            columns: newColumns,
            columnOrder: state.columnOrder.filter(colId => colId !== id)
          }
        })
      },

      reorderColumns: (newOrder) => {
        set({ columnOrder: newOrder })
      }
    }),
    {
      name: 'githubmon-kanban',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
