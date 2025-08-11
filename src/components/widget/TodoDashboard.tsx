import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { KanbanBoard } from '../kanban/KanbanBoard'
import { useKanbanStore } from '@/stores/kanban'

export const TodoDashboard = () => {
  const { syncFromGitHub } = useKanbanStore()
  const { githubSettings } = useSettingsStore()
  
  useEffect(() => {
    syncFromGitHub()
  }, [syncFromGitHub])
  
  useEffect(() => {
    syncFromGitHub()
  }, [githubSettings, syncFromGitHub])
  
  return <KanbanBoard />
}