import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Edit, Save, Trash2, X } from "lucide-react";
import { KanbanTask, useKanbanStore } from "@/stores/kanban";
import { useCallback, useState, useEffect } from "react";
import { sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";

interface TaskDetailModalProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
}: TaskDetailModalProps) {
  const { updateTask, deleteTask } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    notes: "",
    dueDate: "",
    tags: [] as string[],
    timeEstimate: "",
    timeSpent: "",
  });
  const [tagInput, setTagInput] = useState("");

  const handleClose = useCallback(() => {
    setIsEditing(false);
    setTagInput("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        notes: task.notes || "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        tags: task.tags || [],
        timeEstimate: task.timeEstimate?.toString() || "",
        timeSpent: task.timeSpent?.toString() || "",
      });
      setIsEditing(false);
      setTagInput("");
    }
  }, [task]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !editData.tags.includes(trimmedTag)) {
      setEditData({ ...editData, tags: [...editData.tags, trimmedTag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSave = () => {
    if (task) {
      updateTask(task.id, {
        title: editData.title,
        description: editData.description || undefined,
        priority: editData.priority,
        notes: editData.notes || undefined,
        dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
        tags: editData.tags.length > 0 ? editData.tags : undefined,
        timeEstimate: editData.timeEstimate ? parseFloat(editData.timeEstimate) : undefined,
        timeSpent: editData.timeSpent ? parseFloat(editData.timeSpent) : undefined,
      });
      toast.success("Task updated");
      setIsEditing(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        notes: task.notes || "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        tags: task.tags || [],
        timeEstimate: task.timeEstimate?.toString() || "",
        timeSpent: task.timeSpent?.toString() || "",
      });
      setTagInput("");
    }
    setIsEditing(false);
  }, [task]);

  const handleDelete = () => {
    if (task && confirm("Delete this task?")) {
      deleteTask(task.id);
      toast.success("Task deleted");
      handleClose();
    }
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔴 Urgent";
      case "high":
        return "🟠 High";
      case "medium":
        return "🟡 Medium";
      case "low":
        return "🟢 Low";
      default:
        return "🟡 Medium";
    }
  };

  if (!task) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="flex-1 pr-4">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="text-xl font-semibold"
                />
              ) : (
                <span className="text-xl font-semibold">{sanitizeText(task.title)}</span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {task.githubUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={task.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Priority & Type */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Select
                value={editData.priority}
                onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                  setEditData({ ...editData, priority: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline">
                {getPriorityDisplay(task.priority)}
              </Badge>
            )}
            <Badge variant="secondary">
              {task.type === "personal"
                ? "👤 Personal"
                : task.type === "github-pr"
                ? "🔄 PR"
                : "🐛 Issue"}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Task description..."
                rows={3}
                className="mt-2"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-2 min-h-[60px] p-3 bg-muted/30 rounded border">
                {task.description || "No description"}{" "}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium">Notes</Label>
            {isEditing ? (
              <Textarea
                value={editData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                placeholder="Your personal notes..."
                rows={4}
                className="mt-2"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-2 min-h-[80px] p-3 bg-muted/30 rounded border">
                {task.notes || "No notes"}
              </p>
            )}
          </div>

          <Separator />

          {/* Due Date */}
          <div>
            <Label className="text-sm font-medium">Due Date</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.dueDate}
                onChange={(e) =>
                  setEditData({ ...editData, dueDate: e.target.value })
                }
                className="mt-2"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                {task.dueDate ? formatDate(task.dueDate) : "No due date set"}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium">Tags</Label>
            {isEditing ? (
              <>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {editData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags && task.tags.length > 0 ? (
                  task.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            )}
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div>
              <Label className="text-sm font-medium">GitHub Labels</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {task.labels.map((label, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p>{formatDate(task.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <p>{formatDate(task.updatedAt)}</p>
            </div>
          </div>

          <Separator />

          {/* Delete Button */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {task.type === "personal"
                ? "Personal Task"
                : "Synchronized from GitHub"}
            </span>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
