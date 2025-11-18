"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { useKanbanStore } from "@/stores/kanban";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ColumnManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditableColumnProps {
  columnId: string;
  title: string;
  color: string;
  taskCount: number;
  onUpdate: (id: string, title: string, color: string) => void;
  onDelete: (id: string) => void;
}

function EditableColumn({
  columnId,
  title,
  color,
  taskCount,
  onUpdate,
  onDelete,
}: EditableColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editColor, setEditColor] = useState(color);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(columnId, editTitle.trim(), editColor);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditColor(color);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border rounded bg-background hover:bg-muted/30 transition-colors"
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`title-${columnId}`} className="text-xs">
              Title
            </Label>
            <Input
              id={`title-${columnId}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`color-${columnId}`} className="text-xs">
              Color
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id={`color-${columnId}`}
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-20 h-9"
              />
              <Input
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{title}</span>
            <Badge variant="outline" className="text-xs">
              {taskCount}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(columnId)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ColumnManagementModal({
  isOpen,
  onClose,
}: ColumnManagementModalProps) {
  const { columns, columnOrder, updateColumn, addColumn, deleteColumn, reorderColumns } =
    useKanbanStore();
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#6366f1");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleClose = useCallback(() => {
    setShowAddColumn(false);
    setNewColumnTitle("");
    setNewColumnColor("#6366f1");
    onClose();
  }, [onClose]);

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim(), newColumnColor);
      setNewColumnTitle("");
      setNewColumnColor("#6366f1");
      setShowAddColumn(false);
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns[columnId];
    const taskCount = column?.taskIds.length || 0;

    if (taskCount > 0) {
      if (!confirm(`This column has ${taskCount} tasks. Are you sure you want to delete it? Tasks will be removed.`)) {
        return;
      }
    }

    deleteColumn(columnId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = columnOrder.indexOf(active.id as string);
    const newIndex = columnOrder.indexOf(over.id as string);

    const newOrder = [...columnOrder];
    const [removed] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, removed);

    reorderColumns(newOrder);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnOrder}
              strategy={verticalListSortingStrategy}
            >
              {columnOrder.map((columnId) => {
                const column = columns[columnId];
                if (!column) return null;

                return (
                  <EditableColumn
                    key={columnId}
                    columnId={columnId}
                    title={column.title}
                    color={column.color}
                    taskCount={column.taskIds.length}
                    onUpdate={updateColumn}
                    onDelete={handleDeleteColumn}
                  />
                );
              })}
            </SortableContext>
          </DndContext>

          {showAddColumn ? (
            <div className="p-3 border-2 border-dashed rounded space-y-3">
              <div>
                <Label htmlFor="new-column-title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="new-column-title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-column-color" className="text-xs">
                  Color
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-column-color"
                    type="color"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    className="w-20 h-9"
                  />
                  <Input
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnTitle("");
                    setNewColumnColor("#6366f1");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddColumn(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
