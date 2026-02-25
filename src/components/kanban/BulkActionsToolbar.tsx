"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Archive,
  Trash2,
  MoveRight,
  AlertTriangle,
  X,
  Layers,
} from "lucide-react";
import { useKanbanStore } from "@/stores/kanban";
import { toast } from "sonner";
import type { KanbanTask } from "@/stores/kanban";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BulkActionsToolbarProps {
  selectedTaskIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedTaskIds,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const {
    bulkArchive,
    bulkDelete,
    bulkMove,
    bulkUpdatePriority,
    columns,
    columnOrder,
  } = useKanbanStore();

  if (selectedTaskIds.size === 0) return null;

  const handleBulkArchive = () => {
    const count = selectedTaskIds.size;
    if (confirm(`Archive ${count} task(s)?`)) {
      bulkArchive(Array.from(selectedTaskIds));
      onClearSelection();
      toast.success(`Archived ${count} task(s)`);
    }
  };

  const handleBulkDelete = () => {
    const count = selectedTaskIds.size;
    if (
      confirm(
        `Permanently delete ${count} task(s)? This action cannot be undone.`
      )
    ) {
      bulkDelete(Array.from(selectedTaskIds));
      onClearSelection();
      toast.success(`Deleted ${count} task(s)`);
    }
  };

  const handleBulkMove = (columnId: string) => {
    const count = selectedTaskIds.size;
    const column = columns[columnId];
    bulkMove(Array.from(selectedTaskIds), columnId);
    onClearSelection();
    toast.success(`Moved ${count} task(s) to ${column.title}`);
  };

  const handleBulkPriority = (priority: KanbanTask["priority"]) => {
    const count = selectedTaskIds.size;
    bulkUpdatePriority(Array.from(selectedTaskIds), priority);
    onClearSelection();
    toast.success(`Updated priority for ${count} task(s)`);
  };

  return (
    <AnimatePresence>
      {selectedTaskIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="sticky top-4 z-50 flex items-center gap-4 p-2 pl-4 bg-slate-900/80 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20"
        >
          <div className="flex items-center gap-2 pr-4 border-r border-slate-800">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/20">
              {selectedTaskIds.size}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={handleBulkMove}>
              <SelectTrigger className="w-[160px] h-9 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <MoveRight className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Move to..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                {columnOrder.map((columnId) => {
                  const column = columns[columnId];
                  return (
                    <SelectItem key={columnId} value={columnId} className="hover:bg-slate-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        {column.title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select onValueChange={handleBulkPriority}>
              <SelectTrigger className="w-[140px] h-9 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <Layers className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="urgent" className="hover:bg-slate-800 cursor-pointer">🔴 Urgent</SelectItem>
                <SelectItem value="high" className="hover:bg-slate-800 cursor-pointer">🟠 High</SelectItem>
                <SelectItem value="medium" className="hover:bg-slate-800 cursor-pointer">🟡 Medium</SelectItem>
                <SelectItem value="low" className="hover:bg-slate-800 cursor-pointer">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-2" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkArchive}
              className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="ml-2 hover:bg-slate-800 rounded-full h-8 w-8 p-0"
          >
            <X className="w-4 h-4 text-slate-500" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
