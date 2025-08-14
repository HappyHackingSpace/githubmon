'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePreferencesStore } from '@/stores'
import { useRequireAuth } from '@/hooks/useAuth'
import { ThemeSelector } from '@/components/theme/ThemeToggle'
import { cookieUtils } from '@/lib/cookies'
import { GitHubSettingsForm } from '@/components/settings/GitHubSettingsForm'
import { useKanbanStore } from '@/stores/kanban'
import { useActionItemsStore } from '@/stores'
import { 
 Settings, 
 Github, 
 Palette, 
 Database, 
 Columns, 
 Bell,

 Download,

 Trash2,

 AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
 const { isLoading } = useRequireAuth()
 const { resetPreferences, searchResultsPerPage, setSearchResultsPerPage } = usePreferencesStore()
 const { columns, columnOrder, addColumn, deleteColumn } = useKanbanStore()
 const { clearAll } = useActionItemsStore()
 const [newColumnName, setNewColumnName] = useState('')
 const [newColumnColor, setNewColumnColor] = useState('#6366f1')

 const handleClearData = () => {
   if (confirm('All data will be deleted. Are you sure?')) {
     resetPreferences()
     clearAll()
     cookieUtils.removeAuth()
     localStorage.clear()
     window.location.reload()
   }
 }

 const handleExportData = () => {
   const data = {
     preferences: usePreferencesStore.getState(),
     kanban: useKanbanStore.getState(),
     actionItems: useActionItemsStore.getState(),
     timestamp: new Date().toISOString()
   }
   const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `githubmon-backup-${new Date().toISOString().split('T')[0]}.json`
   a.click()
   URL.revokeObjectURL(url)
 }



 const handleAddColumn = () => {
   if (newColumnName.trim()) {
     addColumn(newColumnName.trim(), newColumnColor)
     setNewColumnName('')
     setNewColumnColor('#6366f1')
   }
 }

 if (isLoading) {
   return (
     <Layout>
       <div className="min-h-screen flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
           <p className="text-gray-600">Loading settings...</p>
         </div>
       </div>
     </Layout>
   )
 }

 return (
   <Layout>
     <div className="max-w-5xl mx-auto p-6">
       <div className="flex items-center gap-3 mb-8">
         <Settings className="w-8 h-8" />
         <h1 className="text-3xl font-bold">Settings</h1>
       </div>

       <Tabs defaultValue="github" className="space-y-6">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="github" className="flex items-center gap-2">
             <Github className="w-4 h-4" />
             GitHub
           </TabsTrigger>
           
           <TabsTrigger value="kanban" className="flex items-center gap-2">
             <Columns className="w-4 h-4" />
             Kanban
           </TabsTrigger>
           
           <TabsTrigger value="appearance" className="flex items-center gap-2">
             <Palette className="w-4 h-4" />
             Appearance
           </TabsTrigger>
           
           <TabsTrigger value="data" className="flex items-center gap-2">
             <Database className="w-4 h-4" />
             Data
           </TabsTrigger>
         </TabsList>

         <TabsContent value="github" className="space-y-6">
           
             <CardContent>
               <GitHubSettingsForm />
             </CardContent>
         
         </TabsContent>

         <TabsContent value="kanban" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Columns className="w-5 h-5" />
                 Kanban Columns
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div>
                 <Label className="text-sm font-medium">Current Columns</Label>
                 <div className="mt-3 space-y-2">
                   {columnOrder.map((columnId) => {
                     const column = columns[columnId]
                     return (
                       <div key={columnId} className="flex items-center justify-between p-3 border rounded">
                         <div className="flex items-center gap-3">
                           <div 
                             className="w-4 h-4 rounded"
                             style={{ backgroundColor: column.color }}
                           />
                           <span className="font-medium">{column.title}</span>
                           <Badge variant="outline">{column.taskIds.length} tasks</Badge>
                         </div>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => deleteColumn(columnId)}
                           disabled={['todo', 'in-progress', 'review', 'done'].includes(columnId)}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     )
                   })}
                 </div>
               </div>

               <Separator />

               <div>
                 <Label className="text-sm font-medium">Add New Column</Label>
                 <div className="mt-3 space-y-3">
                   <Input
                     placeholder="Column name"
                     value={newColumnName}
                     onChange={(e) => setNewColumnName(e.target.value)}
                   />
                   <div className="flex items-center gap-3">
                     <Input
                       type="color"
                       value={newColumnColor}
                       onChange={(e) => setNewColumnColor(e.target.value)}
                       className="w-16 h-9"
                     />
                     <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                       Add Column
                     </Button>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>

         <TabsContent value="appearance" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Palette className="w-5 h-5" />
                 Appearance & Display
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div>
                 <Label className="text-sm font-medium">Theme</Label>
                 <div className="mt-3">
                   <ThemeSelector />
                 </div>
                 <p className="text-xs text-muted-foreground mt-2">
                   Choose your preferred color theme or follow system preference
                 </p>
               </div>

               <Separator />

              
             </CardContent>
           </Card>
         </TabsContent>

        

         <TabsContent value="data" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Database className="w-5 h-5" />
                 Data Management
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div>
                 <Label className="text-sm font-medium">Backup & Restore</Label>
                 <div className="flex gap-3 mt-3">
                   <Button onClick={handleExportData} variant="outline">
                     <Download className="w-4 h-4 mr-2" />
                     Export Data
                   </Button>
                  
                 </div>
                 <p className="text-xs text-muted-foreground mt-2">
                   Export your settings and data for backup or transfer to another device
                 </p>
               </div>

               <Separator />

               <div>
                 <Label className="text-sm font-medium">Clear All Data</Label>
                 <div className="mt-3 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                   <div className="flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                     <div className="flex-1">
                       <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                         This will permanently delete all your settings, kanban data, 
                         cached GitHub data, and preferences. This action cannot be undone.
                       </p>
                       <Button variant="destructive" onClick={handleClearData}>
                         <Trash2 className="w-4 h-4 mr-2" />
                         Clear All Data
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   </Layout>
 )
}