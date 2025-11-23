"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Edit,
  Save,
  Trash2,
  X,
  Clock,
  Calendar,
  Tag,
  Activity,
  Timer,
  AlertCircle,
  CheckCircle2,
  Circle,
  Link as LinkIcon
} from "lucide-react";
import { KanbanTask, useKanbanStore } from "@/stores/kanban";
import { useCallback, useState, useEffect } from "react";
import { sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("details");

  const handleClose = useCallback(() => {
    setIsEditing(false);
    setTagInput("");
    setActiveTab("details");
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
      toast.success("Task updated successfully");
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
    if (task && confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      deleteTask(task.id);
      toast.success("Task deleted");
      handleClose();
    }
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatDateShort = (date: Date | string | undefined | null) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "urgent":
        return {
          icon: AlertCircle,
          label: "Urgent",
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-800"
        };
      case "high":
        return {
          icon: AlertCircle,
          label: "High",
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-50 dark:bg-orange-950/20",
          border: "border-orange-200 dark:border-orange-800"
        };
      case "medium":
        return {
          icon: Circle,
          label: "Medium",
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          border: "border-yellow-200 dark:border-yellow-800"
        };
      case "low":
        return {
          icon: CheckCircle2,
          label: "Low",
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-950/20",
          border: "border-green-200 dark:border-green-800"
        };
      default:
        return {
          icon: Circle,
          label: "Medium",
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          border: "border-yellow-200 dark:border-yellow-800"
        };
    }
  };

  const getTimeProgress = () => {
    const estimate = parseFloat(editData.timeEstimate) || 0;
    const spent = parseFloat(editData.timeSpent) || 0;
    if (estimate === 0) return 0;
    return Math.min((spent / estimate) * 100, 100);
  };

  const getDueDateStatus = () => {
    if (!editData.dueDate) return null;
    const now = new Date();
    const due = new Date(editData.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "overdue", color: "text-red-600", text: "Overdue", icon: AlertCircle };
    if (diffDays === 0) return { status: "today", color: "text-orange-600", text: "Due today", icon: AlertCircle };
    if (diffDays <= 3) return { status: "soon", color: "text-yellow-600", text: `Due in ${diffDays}d`, icon: Clock };
    return { status: "normal", color: "text-muted-foreground", text: `Due in ${diffDays}d`, icon: Clock };
  };

  if (!task) return null;

  const priorityConfig = getPriorityConfig(isEditing ? editData.priority : task.priority);
  const PriorityIcon = priorityConfig.icon;
  const dueDateStatus = getDueDateStatus();
  const timeProgress = getTimeProgress();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className={cn("p-6 pb-4 border-b", priorityConfig.bg, priorityConfig.border)}>
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="text-xl font-semibold bg-background"
                />
              ) : (
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {sanitizeText(task.title)}
                </DialogTitle>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-md", priorityConfig.bg, priorityConfig.border, "border")}>
                  <PriorityIcon className={cn("w-4 h-4", priorityConfig.color)} />
                  <span className={cn("text-sm font-medium", priorityConfig.color)}>
                    {priorityConfig.label}
                  </span>
                </div>

                <Badge variant="secondary" className="gap-1.5">
                  {task.type === "personal" ? "👤" : task.type === "github-pr" ? "🔄" : "🐛"}
                  <span>
                    {task.type === "personal" ? "Personal" : task.type === "github-pr" ? "Pull Request" : "Issue"}
                  </span>
                </Badge>

                {dueDateStatus && (
                  <Badge variant="outline" className={cn("gap-1.5", dueDateStatus.color)}>
                    <dueDateStatus.icon className="w-3 h-3" />
                    {dueDateStatus.text}
                  </Badge>
                )}
              </div>
            </div>

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
                  variant="default"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b px-6 h-12 bg-muted/30">
              <TabsTrigger value="details" className="gap-2">
                <LinkIcon className="w-4 h-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" />
                Activity
                {task.activities && task.activities.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {task.activities.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="time" className="gap-2">
                <Timer className="w-4 h-4" />
                Time Tracking
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="p-6 space-y-6 mt-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-6">
                  {/* Priority */}
                  {isEditing && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Priority
                      </Label>
                      <Select
                        value={editData.priority}
                        onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                          setEditData({ ...editData, priority: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low Priority</SelectItem>
                          <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                          <SelectItem value="high">🟠 High Priority</SelectItem>
                          <SelectItem value="urgent">🔴 Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditData({ ...editData, description: e.target.value })
                        }
                        placeholder="Describe the task..."
                        rows={4}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg border min-h-[100px]">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {task.description || "No description provided"}
                        </p>
                      </div>
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
                        placeholder="Add your personal notes..."
                        rows={4}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg border min-h-[100px]">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {task.notes || "No notes added"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </Label>
                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-2">
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
                          <div className="flex flex-wrap gap-2">
                            {editData.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="hover:text-red-600 p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.tags && task.tags.length > 0 ? (
                          task.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No tags</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GitHub Labels */}
                  {task.labels.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">GitHub Labels</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.labels.map((label, index) => (
                          <Badge key={index} variant="outline">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Due Date */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </Label>
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
                      <p className="text-sm mt-2 px-3 py-2 bg-muted/30 rounded-md">
                        {task.dueDate ? formatDateShort(task.dueDate) : "Not set"}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Metadata */}
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Created</span>
                      <p className="font-medium">{formatDateShort(task.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Last Updated</span>
                      <p className="font-medium">{formatDateShort(task.updatedAt)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Type</span>
                      <p className="font-medium">
                        {task.type === "personal" ? "Personal Task" : "GitHub Synced"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6 mt-0">
              {task.activities && task.activities.length > 0 ? (
                <div className="space-y-4">
                  {task.activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        {index < task.activities!.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium capitalize">{activity.action}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.details}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activity recorded yet</p>
                </div>
              )}
            </TabsContent>

            {/* Time Tracking Tab */}
            <TabsContent value="time" className="p-6 mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Estimate (hours)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editData.timeEstimate}
                      onChange={(e) =>
                        setEditData({ ...editData, timeEstimate: e.target.value })
                      }
                      placeholder="0"
                      className="mt-2"
                    />
                  ) : (
                    <p className="text-2xl font-bold mt-2">
                      {task.timeEstimate ? `${task.timeEstimate}h` : "-"}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Time Spent (hours)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editData.timeSpent}
                      onChange={(e) =>
                        setEditData({ ...editData, timeSpent: e.target.value })
                      }
                      placeholder="0"
                      className="mt-2"
                    />
                  ) : (
                    <p className="text-2xl font-bold mt-2">
                      {task.timeSpent ? `${task.timeSpent}h` : "-"}
                    </p>
                  )}
                </div>
              </div>

              {(task.timeEstimate || editData.timeEstimate) && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(timeProgress)}%</span>
                  </div>
                  <Progress value={timeProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {parseFloat(editData.timeSpent) || 0} of {parseFloat(editData.timeEstimate) || 0} hours completed
                  </p>
                </div>
              )}

              {!task.timeEstimate && !isEditing && (
                <div className="text-center py-12 text-muted-foreground">
                  <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No time tracking data</p>
                  <p className="text-sm mt-2">Click Edit to add time estimates</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted/30 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Task ID: {task.id}
          </span>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
