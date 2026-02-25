"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Archive, X } from "lucide-react";
import { useKanbanStore } from "@/stores/kanban";
import { cn } from "@/lib/utils";

export function KanbanFilters() {
  const {
    searchQuery,
    filterPriority,
    filterType,
    showArchived,
    setSearchQuery,
    setFilterPriority,
    setFilterType,
    toggleShowArchived,
    tasks,
    archivedTasks,
  } = useKanbanStore();

  const hasActiveFilters = searchQuery || filterPriority !== "all" || filterType !== "all";
  const activeTaskCount = Object.keys(tasks).length;
  const archivedTaskCount = Object.keys(archivedTasks).length;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterPriority("all");
    setFilterType("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search tasks, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-800 text-slate-300">
              <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">🔴 Urgent</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-800 text-slate-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="github-issue">🐛 Issues</SelectItem>
              <SelectItem value="github-pr">🔄 PRs</SelectItem>
              <SelectItem value="personal">👤 Personal</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        {archivedTaskCount > 0 && (
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={toggleShowArchived}
            className={cn(
              "gap-2 ml-auto",
              showArchived ? "bg-primary" : "bg-slate-900/50 border-slate-800 text-slate-400"
            )}
          >
            <Archive className="w-4 h-4" />
            Archive
            <Badge variant="secondary" className="ml-1 bg-slate-800 border-slate-700">
              {archivedTaskCount}
            </Badge>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span>{activeTaskCount} active tasks</span>
        {archivedTaskCount > 0 && (
          <>
            <span className="text-slate-700">•</span>
            <span>{archivedTaskCount} archived</span>
          </>
        )}
      </div>
    </div>
  );
}
