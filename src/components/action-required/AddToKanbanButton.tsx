"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle } from "lucide-react";
import { useKanbanStore } from "@/stores";
import type {
  ActionItem,
  AssignedItem,
  MentionItem,
  StalePR,
} from "@/stores/actionItems";
import { useRouter } from "next/navigation";

interface AddToKanbanButtonProps {
  item: ActionItem | AssignedItem | MentionItem | StalePR;
}

export function AddToKanbanButton({ item }: AddToKanbanButtonProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { addTaskFromActionItem, columns, columnOrder } = useKanbanStore();
  const router = useRouter();

  const handleAdd = () => {
    setIsAdding(true);
    try {
      addTaskFromActionItem(item, notes, selectedColumn);
      setShowSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setNotes("");
        setSelectedColumn("todo");
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to add task to kanban:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewKanban = () => {
    setOpen(false);
    router.push("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Add to Kanban"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add to Personal Kanban</DialogTitle>
          <DialogDescription>
            Add this item to your personal task board on the Dashboard
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-medium">Added to Kanban!</p>
            <Button variant="outline" onClick={handleViewKanban}>
              View Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Task</Label>
                <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {item.repo}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="column" className="text-sm font-medium">
                  Column
                </Label>
                <Select
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                >
                  <SelectTrigger id="column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOrder.map((columnId: string) => {
                      const column = columns[columnId];
                      return (
                        <SelectItem key={columnId} value={columnId}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: column.color }}
                            />
                            {column.title}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this task..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={isAdding}>
                {isAdding ? "Adding..." : "Add to Kanban"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
