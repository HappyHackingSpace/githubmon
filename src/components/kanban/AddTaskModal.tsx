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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, Tag, AlertCircle } from "lucide-react";
import { useKanbanStore } from "@/stores/kanban";
import { cn } from "@/lib/utils";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string | null;
}

export function AddTaskModal({ isOpen, onClose, columnId }: AddTaskModalProps) {
  const { addTask } = useKanbanStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const handleClose = useCallback(() => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setTags([]);
    setTagInput("");
    setError("");
    onClose();
  }, [onClose]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!columnId) {
      setError("Column ID is missing");
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      type: "personal",
      priority,
      labels: [],
      tags: tags.length > 0 ? tags : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      columnId,
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 bg-slate-900/90 backdrop-blur-xl border-slate-800 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-800/20">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-500">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="What needs to be done?"
              className={cn(
                "bg-slate-800/50 border-slate-700 focus:border-primary/50 text-white placeholder:text-slate-600 rounded-xl py-6",
                error && !title.trim() && "border-red-500/50 focus:border-red-500"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Add more details about this task..."
              rows={3}
              className="bg-slate-800/50 border-slate-700 focus:border-primary/50 text-white placeholder:text-slate-600 rounded-xl min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Priority
              </Label>
              <Select
                value={priority}
                onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                  setPriority(value)
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type and press enter..."
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 rounded-xl"
              />
              <Button type="button" variant="outline" onClick={handleAddTag} className="border-slate-700 hover:bg-slate-800 rounded-xl">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-slate-800 border-slate-700 text-slate-300 pl-2 pr-1 h-7">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-slate-800 bg-slate-800/20 flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-white rounded-xl">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim()}
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
