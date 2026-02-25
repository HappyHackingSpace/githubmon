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
import { Trash2, GripVertical, Plus, Settings2, Palette, ShieldAlert } from "lucide-react";
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
  wipLimit?: number;
  onUpdate: (id: string, title: string, color: string, wipLimit?: number) => void;
  onDelete: (id: string) => void;
}

function EditableColumn({
  columnId,
  title,
  color,
  taskCount,
  wipLimit,
  onUpdate,
  onDelete,
}: EditableColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editColor, setEditColor] = useState(color);
  const [editWipLimit, setEditWipLimit] = useState(wipLimit?.toString() || "");

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
      const wipLimitNum = editWipLimit ? parseInt(editWipLimit, 10) : undefined;
      onUpdate(columnId, editTitle.trim(), editColor, wipLimitNum);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditColor(color);
    setEditWipLimit(wipLimit?.toString() || "");
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl hover:border-primary/30 transition-all group shadow-lg"
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
          <div>
            <Label htmlFor={`wip-${columnId}`} className="text-xs">
              WIP Limit (optional)
            </Label>
            <Input
              id={`wip-${columnId}`}
              type="number"
              min="0"
              value={editWipLimit}
              onChange={(e) => setEditWipLimit(e.target.value)}
              placeholder="No limit"
              className="mt-1"
            />
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
            {wipLimit && (
              <Badge variant="secondary" className="text-xs">
                WIP: {wipLimit}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-white rounded-lg h-8 px-3"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(columnId)}
              className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg h-8 w-8 p-0"
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
  const [newColumnWipLimit, setNewColumnWipLimit] = useState("");

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
    setNewColumnWipLimit("");
    onClose();
  }, [onClose]);

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const wipLimitNum = newColumnWipLimit ? parseInt(newColumnWipLimit, 10) : undefined;
      addColumn(newColumnTitle.trim(), newColumnColor, wipLimitNum);
      setNewColumnTitle("");
      setNewColumnColor("#6366f1");
      setNewColumnWipLimit("");
      setShowAddColumn(false);
    }
  };

  const handleUpdateColumn = (id: string, title: string, color: string, wipLimit?: number) => {
    updateColumn(id, { title, color, wipLimit });
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 bg-slate-900/90 backdrop-blur-xl border-slate-800 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-800/20">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            Manage Columns
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    wipLimit={column.wipLimit}
                    onUpdate={handleUpdateColumn}
                    onDelete={handleDeleteColumn}
                  />
                );
              })}
            </SortableContext>
          </DndContext>

          {showAddColumn ? (
            <div className="p-6 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-column-title" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  New Title
                </Label>
                <Input
                  id="new-column-title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="e.g. In Review, Testing..."
                  className="bg-slate-800/50 border-slate-700 text-white rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-column-color" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-column-color"
                      type="color"
                      value={newColumnColor}
                      onChange={(e) => setNewColumnColor(e.target.value)}
                      className="w-12 h-10 p-1 bg-slate-800/50 border-slate-700 rounded-xl cursor-pointer"
                    />
                    <Input
                      value={newColumnColor}
                      onChange={(e) => setNewColumnColor(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1 bg-slate-800/50 border-slate-700 text-white rounded-xl h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-column-wip" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> WIP Limit
                  </Label>
                  <Input
                    id="new-column-wip"
                    type="number"
                    min="0"
                    value={newColumnWipLimit}
                    onChange={(e) => setNewColumnWipLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddColumn(false)} className="text-slate-400 hover:text-white rounded-xl">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddColumn} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6">
                  Add Column
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                disabled={columnOrder.length >= 15}
                className="w-full h-12 bg-slate-800/30 border-dashed border-2 border-slate-700 hover:bg-slate-800 hover:border-primary/50 text-slate-400 hover:text-white rounded-2xl transition-all"
                onClick={() => setShowAddColumn(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {columnOrder.length >= 15 ? "Maximum 15 columns reached" : "Create New Column"}
              </Button>
              {columnOrder.length >= 15 && (
                <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
                  Delete existing columns to add more
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 px-6 border-t border-slate-800 bg-slate-800/10 flex justify-end">
          <Button onClick={handleClose} className="rounded-xl px-8 font-bold">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
