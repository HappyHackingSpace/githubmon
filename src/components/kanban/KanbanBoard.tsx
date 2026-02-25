"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, ExternalLink, GripVertical, Trash2, Eye, RefreshCw, Settings, AlertTriangle, Keyboard, Archive, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKanbanStore, KanbanTask } from "@/stores/kanban";
import { useState, useMemo, useEffect } from "react";
import { TaskDetailModal } from "./TaskDetailModal";
import { AddTaskModal } from "./AddTaskModal";
import { ColumnManagementModal } from "./ColumnManagementModal";
import { KanbanFilters } from "./KanbanFilters";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { ArchiveView } from "./ArchiveView";
import { githubAPIClient } from "@/lib/api/github-api-client";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";
import { sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { useKanbanShortcuts, showKeyboardShortcutsHelp } from "@/hooks/useKanbanShortcuts";
import { motion, AnimatePresence } from "framer-motion";

interface SortableTaskItemProps {
  task: KanbanTask;
  isDragging?: boolean;
  onDelete?: (taskId: string) => void;
  onView?: (task: KanbanTask) => void;
  onSelect?: (taskId: string) => void;
  isSelected?: boolean;
}

function SortableTaskItem({
  task,
  isDragging = false,
  onDelete,
  onView,
  onSelect,
  isSelected,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "overdue", color: "text-red-400", text: "Overdue" };
    if (diffDays === 0) return { status: "today", color: "text-orange-400", text: "Today" };
    if (diffDays <= 3) return { status: "soon", color: "text-yellow-400", text: `${diffDays}d` };
    return { status: "normal", color: "text-slate-400", text: `${diffDays}d` };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative p-3 border border-slate-700/50 rounded-xl bg-slate-800/40 backdrop-blur-sm transition-all duration-300",
        isDragging || isSortableDragging ? "shadow-2xl ring-2 ring-primary/50 z-10" : "hover:border-primary/30 hover:bg-slate-800/60 shadow-sm",
        dueDateStatus?.status === "overdue" && "border-red-500/30",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      {...attributes}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button, a, input')) {
          onView?.(task);
        }
      }}
    >
      <div className="absolute top-3 right-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect?.(task.id)}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "h-4 w-4 rounded border-slate-700 transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        />
      </div>

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-slate-700/50 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <h4 className="text-sm font-semibold leading-tight flex-1 group-hover:text-primary transition-colors">
            {sanitizeText(task.title)}
          </h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-6">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(task);
              }}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-md transition-all"
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {task.githubUrl && (
            <a
              href={task.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-primary p-1 hover:bg-slate-700 rounded-md transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this task?")) {
                  onDelete(task.id);
                  toast.success("Task deleted");
                }
              }}
              className="text-slate-400 hover:text-red-400 p-1 hover:bg-slate-700 rounded-md transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-3 ml-6 line-clamp-2 leading-relaxed">
          {sanitizeText(task.description)}
        </p>
      )}

      <div className="flex items-center justify-between ml-6">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "text-[10px] px-2 py-0 h-4 font-bold uppercase tracking-wider border",
              task.priority === "urgent" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                task.priority === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                  task.priority === "medium" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
            )}
          >
            {task.priority}
          </Badge>
          {dueDateStatus && (
            <span className={cn("text-[10px] font-bold uppercase", dueDateStatus.color)}>
              {dueDateStatus.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {task.tags?.slice(0, 1).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-700 text-slate-500">
              #{tag}
            </Badge>
          ))}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-900/50 border-slate-800 text-slate-400">
            {task.type.replace("github-", "")}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

interface DroppableColumnProps {
  columnId: string;
  children: React.ReactNode;
}

function DroppableColumn({ columnId, children }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="min-h-80">
      {children}
    </div>
  );
}

export function KanbanBoard() {
  const {
    tasks,
    columns,
    columnOrder,
    moveTask,
    syncFromGitHub,
    deleteTask,
    showArchived,
    searchQuery,
    filterPriority,
    filterType,
    autoArchiveOldTasks,
    deduplicateAllColumns,
    customCategories,
    addCustomCategory,
    removeCustomCategory,
  } = useKanbanStore();
  const { orgData } = useAuthStore();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const [showColumnManagement, setShowColumnManagement] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closeOnGitHub, setCloseOnGitHub] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    taskId: string;
    fromColumnId: string;
    toColumnId: string;
    newIndex: number;
  } | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useKanbanShortcuts({
    onNewTask: () => {
      setAddTaskColumnId("todo");
      setShowAddTaskModal(true);
    },
    onSync: handleSyncFromGitHub,
    onSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search tasks..."]');
      searchInput?.focus();
    },
    onArchive: () => {
      useKanbanStore.getState().toggleShowArchived();
    },
    onHelp: showKeyboardShortcutsHelp,
  });

  useEffect(() => {
    deduplicateAllColumns();
  }, [deduplicateAllColumns]);

  // First, filter by all criteria EXCEPT category to calculate counts
  const tasksFilteredByCriteria = useMemo(() => {
    const taskList = Object.values(tasks);
    return taskList.filter((task) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (task.title || "").toLowerCase().includes(query);
        const matchesDescription = (task.description || "").toLowerCase().includes(query);
        const matchesTags = task.tags?.some((tag) => tag.toLowerCase().includes(query));
        const matchesLabels = task.labels?.some((label) => label.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDescription && !matchesTags && !matchesLabels) {
          return false;
        }
      }

      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }

      if (filterType !== "all" && task.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterType]);

  const categoryStats = useMemo(() => {
    const categoriesSet = new Set<string>(["all"]);
    const counts: Record<string, number> = { all: tasksFilteredByCriteria.length };

    // Add custom categories
    (customCategories || []).forEach(cat => {
      categoriesSet.add(cat);
      counts[cat] = 0;
    });

    tasksFilteredByCriteria.forEach((task) => {
      let taskCategory = "";
      if (task.category) {
        taskCategory = task.category;
      } else if (task.type === "personal") {
        taskCategory = "Personal";
      } else if (task.githubUrl) {
        const parts = task.githubUrl.split("/");
        if (parts.length >= 5) {
          taskCategory = parts[4];
        }
      }

      if (taskCategory) {
        categoriesSet.add(taskCategory);
        counts[taskCategory] = (counts[taskCategory] || 0) + 1;
      }
    });

    return {
      categories: Array.from(categoriesSet).sort((a, b) =>
        a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b)
      ),
      counts
    };
  }, [tasksFilteredByCriteria, customCategories]);

  const filteredTasks = useMemo(() => {
    if (activeCategory === "all") return tasksFilteredByCriteria;

    return tasksFilteredByCriteria.filter((task) => {
      if (task.category === activeCategory) {
        return true;
      } else if (task.category) {
        return false;
      } else if (activeCategory === "Personal") {
        return task.type === "personal";
      } else {
        const parts = task.githubUrl?.split("/");
        const repoName = parts && parts.length >= 5 ? parts[4] : null;
        return repoName === activeCategory;
      }
    });
  }, [tasksFilteredByCriteria, activeCategory]);

  const filteredTaskIds = useMemo(
    () => new Set(filteredTasks.map((t) => t.id)),
    [filteredTasks]
  );

  async function handleSyncFromGitHub() {
    setIsSyncing(true);
    try {
      const result = await syncFromGitHub();
      if (result.success) {
        if (result.count === 0) {
          toast.info("Already up to date", {
            description: "All GitHub items are already synced",
          });
        } else {
          toast.success(`Synced ${result.count} new tasks from GitHub`);
        }
      } else {
        toast.error("Sync failed", {
          description: result.error || "Unknown error",
        });
      }
    } catch (error) {
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  const handleAutoArchive = () => {
    const archived = autoArchiveOldTasks();
    if (archived > 0) {
      toast.success(`Auto-archived ${archived} old tasks from Done column`);
    } else {
      toast.info("No tasks to auto-archive");
    }
  };

  const handleTaskView = (task: KanbanTask) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks[active.id as string];
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    let sourceColumnId: string | null = null;
    Object.entries(columns).forEach(([columnId, column]) => {
      if (column.taskIds.includes(activeId)) {
        sourceColumnId = columnId;
      }
    });

    if (!sourceColumnId) return;

    let destinationColumnId: string | null = null;
    let destinationIndex = 0;

    if (columns[overId]) {
      destinationColumnId = overId;
      destinationIndex = 0;
    } else {
      Object.entries(columns).forEach(([columnId, column]) => {
        if (column.taskIds.includes(overId)) {
          destinationColumnId = columnId;
          const targetIndex = column.taskIds.indexOf(overId);
          if (sourceColumnId === destinationColumnId) {
            destinationIndex = targetIndex;
          } else {
            destinationIndex = targetIndex;
          }
        }
      });
    }

    if (!destinationColumnId) return;

    const task = tasks[activeId];
    const destColumn = columns[destinationColumnId];

    if (destColumn.wipLimit && destColumn.taskIds.length >= destColumn.wipLimit) {
      toast.warning("WIP Limit Reached", {
        description: `${destColumn.title} has reached its WIP limit of ${destColumn.wipLimit}`,
      });
      return;
    }

    if (
      destinationColumnId === "done" &&
      task &&
      (task.type === "github-issue" || task.type === "github-pr") &&
      task.githubUrl
    ) {
      setPendingMove({
        taskId: activeId,
        fromColumnId: sourceColumnId,
        toColumnId: destinationColumnId,
        newIndex: destinationIndex,
      });
      setShowCloseConfirm(true);
    } else {
      moveTask(activeId, sourceColumnId, destinationColumnId, destinationIndex);
      toast.success(`Moved to ${destColumn.title}`);
    }
  };

  const handleConfirmClose = async () => {
    if (!pendingMove) return;

    moveTask(
      pendingMove.taskId,
      pendingMove.fromColumnId,
      pendingMove.toColumnId,
      pendingMove.newIndex
    );

    if (closeOnGitHub && orgData?.token) {
      const task = tasks[pendingMove.taskId];
      if (task?.githubUrl) {
        setIsClosing(true);
        try {
          const urlParts = task.githubUrl.split("/");
          const owner = urlParts[urlParts.length - 4];
          const repo = urlParts[urlParts.length - 3];
          const number = parseInt(urlParts[urlParts.length - 1], 10);

          githubAPIClient.setUserToken(orgData.token);

          const result =
            task.type === "github-issue"
              ? await githubAPIClient.closeIssue(owner, repo, number)
              : await githubAPIClient.closePullRequest(owner, repo, number);

          if (result.success) {
            toast.success("Closed on GitHub");
          } else {
            toast.error(`Failed to close on GitHub: ${result.error}`);
          }
        } catch (error) {
          toast.error("Error closing on GitHub");
        } finally {
          setIsClosing(false);
        }
      }
    }

    setPendingMove(null);
    setShowCloseConfirm(false);
    setCloseOnGitHub(false);
  };

  const handleCancelClose = () => {
    setPendingMove(null);
    setShowCloseConfirm(false);
    setCloseOnGitHub(false);
  };

  if (showArchived) {
    return (
      <div className="space-y-4">
        <ArchiveView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Development Board</h2>
          <p className="text-sm text-slate-400">Manage your GitHub workflow with ease</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncFromGitHub}
            variant="default"
            size="sm"
            disabled={isSyncing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-700">
                <Settings className="w-4 h-4 mr-2 text-slate-400" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 backdrop-blur-xl text-slate-100">
              <DropdownMenuLabel>Board Settings</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem onClick={() => setShowColumnManagement(true)} className="hover:bg-slate-800 cursor-pointer">
                <Settings className="w-4 h-4 mr-2 text-slate-400" />
                Manage Columns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAutoArchive} className="hover:bg-slate-800 cursor-pointer">
                <Archive className="w-4 h-4 mr-2 text-slate-400" />
                Auto-Archive Done
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem onClick={showKeyboardShortcutsHelp} className="hover:bg-slate-800 cursor-pointer">
                <Keyboard className="w-4 h-4 mr-2 text-slate-400" />
                Keyboard Shortcuts
                <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">?</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <KanbanFilters />

      <BulkActionsToolbar
        selectedTaskIds={selectedTaskIds}
        onClearSelection={() => setSelectedTaskIds(new Set())}
      />

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-auto flex flex-row flex-nowrap overflow-x-auto justify-start gap-1 scrollbar-hide">
          {categoryStats.categories.map((cat) => (
            <div key={cat} className="relative group/tab">
              <TabsTrigger
                value={cat}
                className="px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2"
              >
                {cat === "all" ? "All Tasks" : cat}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 h-4 min-w-[20px] flex items-center justify-center font-bold border-slate-700/50",
                    activeCategory === cat ? "bg-white/20 text-white border-white/30" : "bg-slate-800/50 text-slate-400"
                  )}
                >
                  {categoryStats.counts[cat] || 0}
                </Badge>
              </TabsTrigger>
              {cat !== 'all' && cat !== 'Personal' && customCategories.includes(cat) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove category "${cat}"? tasks will be moved to default.`)) {
                      removeCustomCategory(cat);
                      if (activeCategory === cat) setActiveCategory('all');
                    }
                  }}
                  className="absolute -top-1 -right-1 opacity-0 group-hover/tab:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-all z-20"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-1 ml-2">
            {isAddingCategory ? (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-left-2">
                <Input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      addCustomCategory(newCategoryName.trim());
                      setNewCategoryName("");
                      setIsAddingCategory(false);
                    } else if (e.key === 'Escape') {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }
                  }}
                  placeholder="Category name..."
                  className="h-7 w-32 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 px-2"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      addCustomCategory(newCategoryName.trim());
                      setNewCategoryName("");
                      setIsAddingCategory(false);
                    }
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-lg border border-dashed border-slate-700 hover:border-primary/50 text-slate-500 hover:text-white transition-all gap-2"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">New Tab</span>
              </Button>
            )}
          </div>
        </TabsList>
      </Tabs>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-20rem)] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter(Boolean)
              .filter((task) => filteredTaskIds.has(task.id));

            const wipWarning = column.wipLimit && columnTasks.length >= column.wipLimit;

            return (
              <Card key={columnId} className="flex-shrink-0 w-80 bg-slate-900/40 backdrop-blur-md border-slate-800/50 shadow-xl overflow-hidden group/column">
                <CardHeader className="pb-3 pt-4 px-4 bg-slate-800/30">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-100">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-lg"
                      style={{ backgroundColor: column.color, boxShadow: `0 0 10px ${column.color}40` }}
                    />
                    {column.title}
                    <div className="ml-auto flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold bg-slate-900/50 border-slate-700/50">
                        {columnTasks.length}
                      </Badge>
                      {column.wipLimit && (
                        <Badge
                          variant={wipWarning ? "destructive" : "secondary"}
                          className="text-[10px] font-bold"
                          title={`WIP Limit: ${column.wipLimit}`}
                        >
                          {wipWarning && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {columnTasks.length}/{column.wipLimit}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <SortableContext
                  items={column.taskIds.filter((id) => filteredTaskIds.has(id))}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn columnId={columnId}>
                    <CardContent className="p-2 space-y-3 min-h-60">
                      <div className="h-1 w-full" />
                      <AnimatePresence mode="popLayout">
                        {columnTasks.map((task) => (
                          <SortableTaskItem
                            key={task.id}
                            task={task}
                            isDragging={activeTask?.id === task.id}
                            onView={handleTaskView}
                            onDelete={handleTaskDelete}
                            onSelect={handleTaskSelect}
                            isSelected={selectedTaskIds.has(task.id)}
                          />
                        ))}
                      </AnimatePresence>

                      <button
                        className="w-full py-4 border-2 border-dashed border-slate-700/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-slate-500 hover:text-primary group/add"
                        onClick={() => {
                          setAddTaskColumnId(columnId);
                          setShowAddTaskModal(true);
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4 transition-transform group-hover/add:scale-125 group-hover/add:rotate-90" />
                          <span className="text-xs font-bold uppercase tracking-wider opacity-0 group-hover/column:opacity-100 transition-opacity">Add Task</span>
                        </div>
                      </button>
                    </CardContent>
                  </DroppableColumn>
                </SortableContext>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-3 border border-primary/30 rounded-xl bg-slate-800 shadow-2xl rotate-2 w-60 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-primary" />
                  <h4 className="text-sm font-semibold leading-tight flex-1 truncate text-white">
                    {sanitizeText(activeTask.title)}
                  </h4>
                </div>
                {activeTask.githubUrl && (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              {activeTask.description && (
                <p className="text-xs text-slate-400 mb-2 ml-6 line-clamp-1">
                  {sanitizeText(activeTask.description)}
                </p>
              )}
              <div className="flex items-center justify-between ml-6">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-700 text-slate-400">
                  {activeTask.priority}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-900/50 border-slate-800 text-slate-400">
                  {activeTask.type.replace("github-", "")}
                </Badge>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTaskId ? tasks[selectedTaskId] : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTaskId(null);
        }}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        columnId={addTaskColumnId}
      />

      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Move to Done</DialogTitle>
            <DialogDescription className="text-slate-400">
              This task is from GitHub. Would you like to close it on GitHub as
              well?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="close-github"
              checked={closeOnGitHub}
              onCheckedChange={(checked) =>
                setCloseOnGitHub(checked === true)
              }
              className="border-slate-700 data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="close-github"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
            >
              Close this {pendingMove && tasks[pendingMove.taskId]?.type === "github-issue" ? "issue" : "PR"} on GitHub
            </Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelClose} className="border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleConfirmClose} disabled={isClosing} className="bg-primary hover:bg-primary/90">
              {isClosing ? "Closing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ColumnManagementModal
        isOpen={showColumnManagement}
        onClose={() => setShowColumnManagement(false)}
      />
    </div>
  );
}
