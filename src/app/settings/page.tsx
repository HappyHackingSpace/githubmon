'use client'

import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRequireAuth } from '@/hooks/useAuth'
import { ThemeSelector } from '@/components/theme/ThemeToggle'
import { GitHubSettingsForm } from '@/components/settings/GitHubSettingsForm'
import { 
 Settings, 
 Github, 
 Palette, 
} from 'lucide-react'

export default function SettingsPage() {
 const { isLoading } = useRequireAuth()

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