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
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">🔴 Urgent</SelectItem>
            <SelectItem value="high">🟠 High</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
            <SelectItem value="low">🟢 Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
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
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}

        {archivedTaskCount > 0 && (
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={toggleShowArchived}
            className="gap-2 ml-auto"
          >
            <Archive className="w-4 h-4" />
            Archive
            <Badge variant="secondary" className="ml-1">
              {archivedTaskCount}
            </Badge>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{activeTaskCount} active tasks</span>
        {archivedTaskCount > 0 && (
          <>
            <span>•</span>
            <span>{archivedTaskCount} archived</span>
          </>
        )}
      </div>
    </div>
  );
}
