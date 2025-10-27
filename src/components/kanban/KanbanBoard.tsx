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
import { Plus, ExternalLink, GripVertical, Trash2, Eye, X } from "lucide-react";
import { useKanbanStore, KanbanTask } from "@/stores/kanban";
import { useState } from "react";
import { TaskDetailModal } from "./TaskDetailModal";
import { AddTaskModal } from "./AddTaskModal";

interface SortableTaskItemProps {
  task: KanbanTask;
  isDragging?: boolean;
  onDelete?: (taskId: string) => void;
  onView?: (task: KanbanTask) => void;
}

function SortableTaskItem({
  task,
  isDragging = false,
  onDelete,
  onView,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2 border rounded bg-background cursor-pointer transition-all ${
        isDragging || isSortableDragging
          ? "shadow-lg"
          : "hover:shadow-md hover:border-primary/30"
      }`}
      {...attributes}
      onClick={() => onView && onView(task)}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-start gap-1 flex-1 min-w-0">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            title="Sürükle"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <h4 className="text-xs font-medium leading-tight flex-1 truncate">
            {task.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(task);
              }}
              className="text-muted-foreground hover:text-blue-600 p-0.5 transition-colors"
              title="Detayları görüntüle"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
          {task.githubUrl && (
            <a
              href={task.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-blue-600 p-0.5 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="GitHub'da aç"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Bu task'ı silmek istediğinizden emin misiniz?")) {
                  onDelete(task.id);
                }
              }}
              className="text-muted-foreground hover:text-red-600 p-0.5 transition-colors"
              title="Sil"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-1 ml-4 line-clamp-1">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between ml-4">
        <Badge
          variant={
            task.priority === "urgent"
              ? "destructive"
              : task.priority === "high"
              ? "destructive"
              : task.priority === "medium"
              ? "default"
              : "secondary"
          }
          className="text-xs px-1 py-0"
        >
          {task.priority}
        </Badge>

        <Badge variant="outline" className="text-xs px-1 py-0">
          {task.type.replace("github-", "")}
        </Badge>
      </div>
    </div>
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
    clearGitHubTasks,
  } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleClearGitHubTasks = async () => {
    if (
      confirm("GitHub tasks will be cleared. Only personal tasks will remain.")
    ) {
      setIsClearing(true);

      try {
        clearGitHubTasks();

        setTimeout(async () => {
          if (
            confirm(
              "🔄 Fresh GitHub data is available. Sync now with context analysis?"
            )
          ) {
            try {
              const taskCount = await syncFromGitHub();
              alert(
                `✅ Sync complete! ${taskCount} tasks added with smart column organization.`
              );
            } catch (error) {
              console.error("Auto-sync failed:", error);
              alert(
                "❌ Auto-sync failed. You can manually sync using the Sync button."
              );
            } finally {
              setIsClearing(false);
            }
          } else {
            setIsClearing(false);
          }
        }, 800);
      } catch (error) {
        console.error("Clear operation failed:", error);
        setIsClearing(false);
      }
    }
  };

  const handleTaskView = (task: KanbanTask) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
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

    moveTask(activeId, sourceColumnId, destinationColumnId, destinationIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Development Tasks</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleClearGitHubTasks}
            variant="outline"
            size="sm"
            disabled={isClearing}
          >
            <X className={`w-4 h-4 mr-2 ${isClearing ? "animate-spin" : ""}`} />
            {isClearing ? "Clearing..." : "Clear"}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter(Boolean);

            return (
              <Card key={columnId} className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    {column.title}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {columnTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <SortableContext
                  items={column.taskIds}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn columnId={columnId}>
                    <CardContent className="space-y-2 min-h-60">
                      <div
                        className="h-2 w-full"
                        style={{
                          backgroundColor: "transparent",
                        }}
                      />
                      {columnTasks.map((task) => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          isDragging={activeTask?.id === task.id}
                          onView={handleTaskView}
                          onDelete={handleTaskDelete}
                        />
                      ))}

                      <button
                        className="w-full p-2 border-2 border-dashed border-muted rounded hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary text-xs"
                        onClick={() => {
                          setAddTaskColumnId(columnId);
                          setShowAddTaskModal(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mx-auto" />
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
            <div className="p-2 border rounded bg-background shadow-lg rotate-2 w-60">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-start gap-1 flex-1 min-w-0">
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                  <h4 className="text-xs font-medium leading-tight flex-1 truncate">
                    {activeTask.title}
                  </h4>
                </div>
                {activeTask.githubUrl && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              {activeTask.description && (
                <p className="text-xs text-muted-foreground mb-1 ml-4 line-clamp-1">
                  {activeTask.description}
                </p>
              )}
              <div className="flex items-center justify-between ml-4">
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {activeTask.priority}
                </Badge>
                <Badge variant="outline" className="text-xs px-1 py-0">
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
    </div>
  );
}
