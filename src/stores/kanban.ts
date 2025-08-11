import { githubAPIClient } from '@/lib/api/github-api-client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useSettingsStore } from './settings'
import { useAuthStore } from './auth'

interface GitHubItem {
  id: string
  title: string
  url: string
  repo: string
  type: string
  pull_request?: boolean
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  labels?: string[]
  createdAt: string
  updatedAt: string
}

export interface KanbanTask {
  id: string
  title: string
  description?: string
  type: 'github-issue' | 'github-pr' | 'personal'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  githubUrl?: string
  labels: string[]
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
  
  syncFromGitHub: () => Promise<void>
  addTask: (task: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<KanbanTask>) => void
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void
  deleteTask: (taskId: string) => void
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
  const { orgData } = useAuthStore.getState()
  
  if (!orgData?.token) return
  
  try {
    githubAPIClient.setUserToken(orgData.token)
    
    const promises = []
    
    if (githubSettings.assignedToMe) {
      promises.push(githubAPIClient.getAssignedItems(orgData.orgName))
    }
    
    if (githubSettings.mentionsMe) {
      promises.push(githubAPIClient.getMentionItems(orgData.orgName))
    }
    
    const results = await Promise.all(promises)
    
    const newTasks = (results.flat() as GitHubItem[]).map((item: GitHubItem) => ({
      id: `github-${item.id}`,
      title: item.title,
      type: item.pull_request ? 'github-pr' as const : 'github-issue' as const,
      priority: item.priority || 'medium' as const,
      githubUrl: item.url,
      labels: item.labels || [],
      description: `${item.repo} - ${item.type || 'issue'}`,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }))
    
    set(state => {
      const personalTasks = Object.values(state.tasks)
        .filter(t => t.type === 'personal')
        .reduce((acc, task) => {
          acc[task.id] = task
          return acc
        }, {} as Record<string, KanbanTask>)
      
      const allTasks = { ...personalTasks }
      newTasks.forEach(task => {
        allTasks[task.id] = task
      })
      
      const todoColumn = state.columns.todo
      const githubTaskIds = newTasks.map(t => t.id)
      const personalTaskIds = todoColumn.taskIds.filter(id => 
        state.tasks[id]?.type === 'personal'
      )
      
      return {
        tasks: allTasks,
        columns: {
          ...state.columns,
          todo: {
            ...todoColumn,
            taskIds: [...personalTaskIds, ...githubTaskIds] 
          }
        }
      }
    })
    
  } catch (error) {
    console.error('GitHub sync failed:', error)
  }
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
              [fromColumnId]: { ...fromColumn, taskIds: fromTaskIds },
              [toColumnId]: { ...toColumn, taskIds: toTaskIds }
            }
          }
        })
      },

        updateTask: (id, updates) => {
            set((state) => {
            const task = state.tasks[id]
            if (!task) return state
    
            return {
                tasks: {
                ...state.tasks,
                [id]: { ...task, ...updates, updatedAt: new Date() }
                }
            }
            })
        },
    
        deleteTask: (taskId) => {
            set((state) => {
            const { [taskId]: _, ...remainingTasks } = state.tasks
            
            const updatedColumns = Object.fromEntries(
                Object.entries(state.columns).map(([colId, column]) => [
                colId,
                { ...column, taskIds: column.taskIds.filter(id => id !== taskId) }
                ])
            )
    
            return {
                tasks: remainingTasks,
                columns: updatedColumns
            }
            })
        },
    
        addColumn: (title, color) => {
            const id = `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            set((state) => ({
            columns: {
                ...state.columns,
                [id]: { id, title, color, taskIds: [] }
            },
            columnOrder: [...state.columnOrder, id]
            }))
        },
    
        updateColumn: (id, updates) => {
            set((state) => ({
            columns: {
                ...state.columns,
                [id]: { ...state.columns[id], ...updates }
            }
            }))
        },
    
        deleteColumn: (id) => {
            set((state) => {
            const { [id]: _, ...remainingColumns } = state.columns
            
            return {
                columns: remainingColumns,
                columnOrder: state.columnOrder.filter(colId => colId !== id)
            }
            })
        },
    
        reorderColumns: (newOrder) => {
            set({ columnOrder: newOrder })
        }
    }

),

    {
      name: 'githubmon-kanban',
      storage: createJSONStorage(() => localStorage)
    }
  )
)