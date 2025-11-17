"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { useKanbanStore, useActionItemsStore } from "@/stores";
import type {
  ActionItem,
  AssignedItem,
  MentionItem,
  StalePR,
} from "@/stores/actionItems";
import { useRouter } from "next/navigation";

interface QuickActionsMenuProps {
  item: ActionItem | AssignedItem | MentionItem | StalePR;
  itemType: "assigned" | "mentions" | "stale";
}

export function QuickActionsMenu({
  item,
  itemType,
}: QuickActionsMenuProps) {
  const [kanbanDialogOpen, setKanbanDialogOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [isAddingToKanban, setIsAddingToKanban] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    addTaskFromActionItem,
    columns,
    columnOrder,
    isActionItemAdded,
    removeActionItemFromKanban,
  } = useKanbanStore();
  const { markAsRead } = useActionItemsStore();
  const router = useRouter();

  const isAlreadyAdded = isActionItemAdded(item.id.toString());

  const handleAddToKanban = () => {
    setIsAddingToKanban(true);
    try {
      addTaskFromActionItem(item, notes, selectedColumn);
      setShowSuccess(true);
      setTimeout(() => {
        setKanbanDialogOpen(false);
        setNotes("");
        setSelectedColumn("todo");
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to add task to kanban:", error);
    } finally {
      setIsAddingToKanban(false);
    }
  };

  const handleRemoveFromKanban = () => {
    try {
      removeActionItemFromKanban(item.id.toString());
    } catch (error) {
      console.error("Failed to remove task from kanban:", error);
    }
  };

  const handleClose = async () => {
    setIsClosing(true);

    try {
      await markAsRead(itemType, item.id.toString());
      setConfirmCloseOpen(false);
    } catch (error) {
      console.error(
        "Error closing item:",
        error instanceof Error ? error.message : "Failed to close item"
      );
    } finally {
      setIsClosing(false);
    }
  };

  const handleViewKanban = () => {
    setKanbanDialogOpen(false);
    router.push("/dashboard");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-1">
        {isAlreadyAdded ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                onClick={handleRemoveFromKanban}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove from Kanban</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setKanbanDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to Kanban</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              onClick={() => setConfirmCloseOpen(true)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Close {item.type === "issue" ? "Issue" : "PR"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={kanbanDialogOpen} onOpenChange={setKanbanDialogOpen}>
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
                  onClick={() => setKanbanDialogOpen(false)}
                  disabled={isAddingToKanban}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddToKanban} disabled={isAddingToKanban}>
                  {isAddingToKanban ? "Adding..." : "Add to Kanban"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Close {item.type === "issue" ? "Issue" : "Pull Request"}?
            </DialogTitle>
            <DialogDescription>
              This will close the {item.type === "issue" ? "issue" : "pull request"} on
              GitHub. You can always reopen it later if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {item.repo}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCloseOpen(false)}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClose}
              disabled={isClosing}
            >
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Close {item.type === "issue" ? "Issue" : "PR"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
