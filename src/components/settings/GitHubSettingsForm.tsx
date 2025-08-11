'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/stores/settings'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'

export function GitHubSettingsForm() {
  const { githubSettings, updateGitHubSettings } = useSettingsStore()
  const [newRepo, setNewRepo] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const addRepository = () => {
    if (newRepo.trim() && !githubSettings.repositories.includes(newRepo.trim())) {
      updateGitHubSettings({
        repositories: [...githubSettings.repositories, newRepo.trim()]
      })
      setNewRepo('')
    }
  }

  const removeRepository = (repo: string) => {
    updateGitHubSettings({
      repositories: githubSettings.repositories.filter(r => r !== repo)
    })
  }

  const addLabel = () => {
    if (newLabel.trim() && !githubSettings.labels.includes(newLabel.trim())) {
      updateGitHubSettings({
        labels: [...githubSettings.labels, newLabel.trim()]
      })
      setNewLabel('')
    }
  }

  const removeLabel = (label: string) => {
    updateGitHubSettings({
      labels: githubSettings.labels.filter(l => l !== label)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 GitHub Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              <Badge key={repo} variant="outline" className="gap-1">
                {repo}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeRepository(repo)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Label Filters */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Important Labels
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Label name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLabel()}
            />
            <Button onClick={addLabel} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {githubSettings.labels.map((label) => (
              <Badge key={label} variant="secondary" className="gap-1">
                {label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeLabel(label)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Preferences</h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Issues/PRs assigned to me</span>
            <Switch
              checked={githubSettings.assignedToMe}
              onCheckedChange={(checked) => 
                updateGitHubSettings({ assignedToMe: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Mentions me</span>
            <Switch
              checked={githubSettings.mentionsMe}
              onCheckedChange={(checked) => 
                updateGitHubSettings({ mentionsMe: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Review requests from me</span>
            <Switch
              checked={githubSettings.reviewRequestedFromMe}
              onCheckedChange={(checked) => 
                updateGitHubSettings({ reviewRequestedFromMe: checked })
              }
            />
          </div>
        </div>

        {/* Stale PR Settings */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Stale PR Threshold (days)
          </label>
          <Input
            type="number"
            min="1"
            max="90"
            value={githubSettings.stalePRDays}
            onChange={(e) => 
              updateGitHubSettings({ stalePRDays: parseInt(e.target.value) || 7 })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}