'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useSettingsStore } from '@/stores/settings'
import { useKanbanStore } from '@/stores/kanban'
import { useState } from 'react'
import { X, Plus, RefreshCw } from 'lucide-react'

export function GitHubSettingsForm() {
  const { githubSettings, updateGitHubSettings } = useSettingsStore()
  const { syncFromGitHub } = useKanbanStore()
  const [newRepo, setNewRepo] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const addRepository = () => {
    if (newRepo.trim() && !githubSettings.repositories.includes(newRepo.trim())) {
      updateGitHubSettings({
        repositories: [...githubSettings.repositories, newRepo.trim()]
      })
      setNewRepo('')
      setHasChanges(true)
    }
  }

  const removeRepository = (repo: string) => {
    console.log('Removing repository:', repo)
    console.log('Current repositories:', githubSettings.repositories)
    updateGitHubSettings({
      repositories: githubSettings.repositories.filter(r => r !== repo)
    })
    setHasChanges(true)
    console.log('Repository removed, hasChanges set to true')
  }

  const addLabel = () => {
    if (newLabel.trim() && !githubSettings.labels.includes(newLabel.trim())) {
      updateGitHubSettings({
        labels: [...githubSettings.labels, newLabel.trim()]
      })
      setNewLabel('')
      setHasChanges(true)
    }
  }

  const removeLabel = (label: string) => {
    console.log('Removing label:', label)
    console.log('Current labels:', githubSettings.labels)
    updateGitHubSettings({
      labels: githubSettings.labels.filter(l => l !== label)
    })
    setHasChanges(true)
    console.log('Label removed, hasChanges set to true')
  }

  const handleSettingChange = <K extends keyof typeof githubSettings>(key: K, value: typeof githubSettings[K]) => {
    updateGitHubSettings({ [key]: value })
    setHasChanges(true)
  }

  const handleSaveAndSync = async () => {
    setIsSyncing(true)
    setHasChanges(false)
    try {
      const taskCount = await syncFromGitHub()
      const message = taskCount !== undefined 
        ? `✅ Settings saved! ${taskCount} tasks found and Kanban board updated.`
        : '✅ Settings saved! Kanban board updated.'
      alert(message)
    } catch (error) {
      console.error('Sync failed:', error)
      alert('❌ Sync failed! Please check your GitHub connection.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🔧 GitHub Settings</CardTitle>
          <Button 
            onClick={handleSaveAndSync} 
            disabled={isSyncing || !hasChanges || githubSettings.repositories.length === 0}
            size="sm"
            variant={hasChanges ? "default" : "outline"}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Saving...' : hasChanges ? 'Save & Sync' : 'Up to date'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bilgi Mesajı */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>How it works:</strong> Configure the settings below according to your preferences and use "Save & Sync" to 
            pull tasks from GitHub to your todo list. Choose which types of tasks are important to you.
          </p>
        </div>

        {/* Repository Filters */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tracked Repositories
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="owner/repo (e.g., microsoft/vscode)"
              value={newRepo}
              onChange={(e) => setNewRepo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRepository()}
            />
            <Button onClick={addRepository} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {githubSettings.repositories.map((repo) => (
              <Badge key={repo} variant="outline" className="gap-1 pr-1">
                <span>{repo}</span>
                <button
                  type="button"
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Removing repository:', repo)
                    removeRepository(repo)
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Label Filters */}
        <div>
          <label className="block text-sm font-medium mb-2">
            🏷️ Important Labels (Optional)
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Track tasks with these labels as priority
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., bug, feature, help-wanted..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLabel()}
            />
            <Button onClick={addLabel} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {githubSettings.labels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {githubSettings.labels.map((label) => (
                <Badge key={label} variant="secondary" className="gap-1 pr-1">
                  <span>{label}</span>
                  <button
                    type="button"
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Removing label:', label)
                      removeLabel(label)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No labels added yet. All tasks will be fetched.
            </p>
          )}
        </div>

        <Separator />

        {/* GitHub Filters */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">🎯 Which Tasks Should Reach You?</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">📌 Tasks assigned to me</span>
                <p className="text-xs text-muted-foreground">Issues and PRs specifically assigned to you</p>
              </div>
              <Switch
                checked={githubSettings.assignedToMe}
                onCheckedChange={(checked) => handleSettingChange('assignedToMe', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">💬 Tasks where I'm mentioned</span>
                <p className="text-xs text-muted-foreground">Tasks where help is requested with @mention</p>
              </div>
              <Switch
                checked={githubSettings.mentionsMe}
                onCheckedChange={(checked) => handleSettingChange('mentionsMe', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">✍️ Tasks I created</span>
                <p className="text-xs text-muted-foreground">Status of issues and PRs you opened</p>
              </div>
              <Switch
                checked={githubSettings.authoredByMe}
                onCheckedChange={(checked) => handleSettingChange('authoredByMe', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">👀 PRs awaiting my review</span>
                <p className="text-xs text-muted-foreground">Pull requests where code review is requested from you</p>
              </div>
              <Switch
                checked={githubSettings.reviewRequestedFromMe}
                onCheckedChange={(checked) => handleSettingChange('reviewRequestedFromMe', checked)}
              />
            </div>
          </div>
        </div>

       

        
      </CardContent>
    </Card>
  )
}