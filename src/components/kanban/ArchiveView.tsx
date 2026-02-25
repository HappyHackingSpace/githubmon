"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { useKanbanStore } from "@/stores/kanban";
import { toast } from "sonner";
import { sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

export function ArchiveView() {
  const { archivedTasks, restoreTask, deleteArchivedTask, clearArchive } =
    useKanbanStore();

  const archivedTasksArray = Object.values(archivedTasks);

  if (archivedTasksArray.length === 0) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 ring-1 ring-slate-700">
            <Archive className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-white mb-2">Safe and Sound</p>
          <p className="text-slate-400 max-w-xs">
            Your archived tasks are tucked away here. Nothing to see yet!
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleRestore = (taskId: string) => {
    restoreTask(taskId);
    toast.success("Task restored to board");
  };

  const handleDelete = (taskId: string) => {
    if (confirm("Permanently delete this task? This cannot be undone.")) {
      deleteArchivedTask(taskId);
      toast.success("Task permanently deleted");
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        `Permanently delete all ${archivedTasksArray.length} archived tasks? This cannot be undone.`
      )
    ) {
      clearArchive();
      toast.success("Archive cleared");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary" />
            Archive Vault
          </h3>
          <p className="text-sm text-slate-400">{archivedTasksArray.length} tasks securely stored</p>
        </div>
        {archivedTasksArray.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="gap-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear Vault
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {archivedTasksArray.map((task) => (
          <Card key={task.id} className="bg-slate-900/40 backdrop-blur-md border-slate-800/50 hover:border-primary/30 transition-all duration-300 group shadow-lg">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <CardTitle className="text-sm font-bold flex items-start gap-2 text-slate-100">
                <span className="flex-1 line-clamp-2 leading-snug">
                  {sanitizeText(task.title)}
                </span>
                {task.githubUrl && (
                  <a
                    href={task.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {task.description && (
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {sanitizeText(task.description)}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px] bg-slate-800/50 border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  {task.type.replace("github-", "")}
                </Badge>
                <Badge
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    task.priority === "urgent" || task.priority === "high"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  )}
                >
                  {task.priority}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Archived {new Date(task.archivedAt || "").toLocaleDateString()}
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                    onClick={() => handleRestore(task.id)}
                    title="Restore to board"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDelete(task.id)}
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
