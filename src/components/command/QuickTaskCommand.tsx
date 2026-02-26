"use client"

import * as React from "react"
import { useKanbanStore, usePreferencesStore, useAuthStore } from "@/stores"
import { githubAPIClient } from "@/lib/api/github-api-client"
import {
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
} from "@/components/ui/command"
import {
    Plus,
    Github,
    User,
    Hash,
    Folder,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface QuickTaskCommandProps {
    onClose: () => void
}

type TaskType = "personal" | "github"

export function QuickTaskCommand({ onClose }: QuickTaskCommandProps) {
    const [taskType, setTaskType] = React.useState<TaskType>("personal")
    const [title, setTitle] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [selectedRepo, setSelectedRepo] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState("")

    const { addTask } = useKanbanStore()
    const { pinnedRepos, categories } = usePreferencesStore()
    const { orgData } = useAuthStore()

    const handleCreateTask = async () => {
        if (!title.trim()) {
            toast.error("Please enter a title")
            return
        }

        setIsSubmitting(true)

        try {
            if (taskType === "personal") {
                addTask({
                    title: title.trim(),
                    type: "personal",
                    priority: "medium",
                    category: selectedCategory || undefined,
                    labels: [],
                })
                toast.success("Personal task created")
                onClose()
            } else {
                if (!selectedRepo) {
                    toast.error("Please select a repository")
                    setIsSubmitting(false)
                    return
                }

                if (!orgData?.token) {
                    toast.error("GitHub token not found")
                    setIsSubmitting(false)
                    return
                }

                const [owner, repo] = selectedRepo.split("/")
                githubAPIClient.setUserToken(orgData.token)

                const result = await githubAPIClient.createIssue(
                    owner,
                    repo,
                    title.trim(),
                    "Created via Quick Task"
                )

                if (result.success) {
                    toast.success("GitHub issue created")
                    onClose()
                } else {
                    toast.error(result.error || "Failed to create issue")
                }
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-900/50">
            <div className="flex items-center gap-2 p-4 border-b border-slate-800">
                <button
                    onClick={() => setTaskType("personal")}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        taskType === "personal"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "text-slate-400 hover:text-slate-200"
                    )}
                >
                    <User className="w-3.5 h-3.5" />
                    Personal Task
                </button>
                <button
                    onClick={() => setTaskType("github")}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        taskType === "github"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "text-slate-400 hover:text-slate-200"
                    )}
                >
                    <Github className="w-3.5 h-3.5" />
                    GitHub Issue
                </button>
            </div>

            <CommandInput
                placeholder={taskType === "personal" ? "Task title..." : "Issue title..."}
                value={title}
                onValueChange={setTitle}
                autoFocus
            />

            <CommandList className="flex-1">
                {taskType === "personal" ? (
                    <CommandGroup heading="Select Category (Optional)">
                        {categories.map((cat) => (
                            <CommandItem
                                key={cat.id}
                                onSelect={() => setSelectedCategory(cat.name)}
                                className={cn(
                                    "flex items-center justify-between",
                                    selectedCategory === cat.name && "bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4" style={{ color: cat.color }} />
                                    <span>{cat.name}</span>
                                </div>
                                {selectedCategory === cat.name && <CheckCircle2 className="w-4 h-4 text-primary" />}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ) : (
                    <CommandGroup heading="Select Repository">
                        {pinnedRepos.length > 0 ? (
                            pinnedRepos.map((repo) => (
                                <CommandItem
                                    key={repo}
                                    onSelect={() => setSelectedRepo(repo)}
                                    className={cn(
                                        "flex items-center justify-between",
                                        selectedRepo === repo && "bg-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-slate-500" />
                                        <span>{repo}</span>
                                    </div>
                                    {selectedRepo === repo && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </CommandItem>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-500">
                                <AlertCircle className="w-4 h-4 mx-auto mb-2 opacity-50" />
                                No pinned repositories found.
                            </div>
                        )}
                    </CommandGroup>
                )}
            </CommandList>

            <div className="p-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] text-slate-500 px-2 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">Enter</kbd> to Create</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">Esc</kbd> to Cancel</span>
                </div>

                <button
                    onClick={handleCreateTask}
                    disabled={isSubmitting || !title.trim() || (taskType === "github" && !selectedRepo)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    {isSubmitting ? "Creating..." : "Create"}
                </button>
            </div>

            {/* Hidden button to trigger submit on Enter within cmdk context */}
            <button
                className="hidden"
                onClick={(e) => {
                    e.preventDefault()
                    handleCreateTask()
                }}
                tabIndex={-1}
            />
        </div>
    )
}
