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
           
           
           <TabsTrigger value="appearance" className="flex items-center gap-2">
             <Palette className="w-4 h-4" />
             Appearance
           </TabsTrigger>
           
          
         </TabsList>

         <TabsContent value="github" className="space-y-6">
           
             <CardContent>
               <GitHubSettingsForm />
             </CardContent>
         
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

        

        
       </Tabs>
     </div>
   </Layout>
 )
}