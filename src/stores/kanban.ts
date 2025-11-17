import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSettingsStore } from "./settings";
import { useActionItemsStore } from "./actionItems";
import type {
  ActionItem,
  AssignedItem,
  MentionItem,
  StalePR,
} from "./actionItems";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  type: "github-issue" | "github-pr" | "personal";
  priority: "low" | "medium" | "high" | "urgent";
  githubUrl?: string;
  labels: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

type SerializedKanbanTask = Omit<KanbanTask, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

interface GitHubItemWithExtras {
  id: string;
  title: string;
  type: "issue" | "pullRequest";
  url?: string;
  createdAt: string;
  updatedAt?: string;
  body?: string;
  labels?: Array<{ name: string }>;
  description?: string;
}

interface GitHubDataContext {
  assignedItems: AssignedItem[];
  mentionItems: MentionItem[];
  staleItems: StalePR[];
  currentTime: Date;
  userSettings: unknown;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  taskIds: string[];
}

interface KanbanState {
  tasks: Record<string, KanbanTask>;
  columns: Record<string, KanbanColumn>;
  columnOrder: string[];
  addedActionItemIds: Set<string>;

  syncFromGitHub: () => Promise<number>;
  addTask: (
    task: Omit<KanbanTask, "id" | "createdAt" | "updatedAt"> & {
      columnId?: string;
    }
  ) => void;
  addTaskFromActionItem: (
    item: ActionItem | AssignedItem | MentionItem | StalePR,
    notes?: string,
    columnId?: string
  ) => string;
  isActionItemAdded: (itemId: string) => boolean;
  updateTask: (id: string, updates: Partial<KanbanTask>) => void;
  moveTask: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) => void;
  deleteTask: (taskId: string) => void;
  clearGitHubTasks: () => void;
  addColumn: (title: string, color: string) => void;
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (newOrder: string[]) => void;
}

const defaultColumns: Record<string, KanbanColumn> = {
  todo: {
    id: "todo",
    title: "To Do",
    color: "#ef4444",
    taskIds: [],
  },
  "in-progress": {
    id: "in-progress",
    title: "In Progress",
    color: "#f59e0b",
    taskIds: [],
  },
  review: {
    id: "review",
    title: "Review",
    color: "#8b5cf6",
    taskIds: [],
  },
  done: {
    id: "done",
    title: "Done",
    color: "#10b981",
    taskIds: [],
  },
};

const analyzeContext = (context: GitHubDataContext) => {
  const suggestions = [];

  const reviewCount = context.mentionItems.filter(
    (item) => "mentionType" in item && item.mentionType === "review_request"
  ).length;

  if (reviewCount >= 3) {
    suggestions.push({
      id: "urgent-reviews",
      title: "Code Reviews",
      color: "#dc2626",
      priority: 1,
      confidence: Math.min(reviewCount * 0.2, 1),
    });
  }

  const isMonday = context.currentTime.getDay() === 1;
  const weekendMentions = context.mentionItems.filter((item) => {
    const itemDate = new Date(item.createdAt || item.updatedAt);
    const dayOfWeek = itemDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  });

  if (isMonday && weekendMentions.length >= 2) {
    suggestions.push({
      id: "weekend-catchup",
      title: "Weekend Catchup",
      color: "#7c3aed",
      priority: 2,
      confidence: 0.8,
    });
  }

  if (context.mentionItems.length >= 5) {
    suggestions.push({
      id: "mentions-focus",
      title: "Needs Response",
      color: "#2563eb",
      priority: 3,
      confidence: 0.7,
    });
  }

  if (context.staleItems.length >= 3) {
    suggestions.push({
      id: "follow-up",
      title: "Follow Up",
      color: "#ea580c",
      priority: 4,
      confidence: 0.6,
    });
  }

  const urgentItems = [
    ...context.assignedItems,
    ...context.mentionItems,
  ].filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const itemWithExtras = item as unknown as GitHubItemWithExtras;
    const body = itemWithExtras.body?.toLowerCase() || "";
    const labels =
      itemWithExtras.labels?.map((l: { name: string }) =>
        l.name.toLowerCase()
      ) || [];

    return (
      title.includes("urgent") ||
      title.includes("hotfix") ||
      title.includes("critical") ||
      body.includes("urgent") ||
      labels.some(
        (label: string) =>
          label.includes("urgent") ||
          label.includes("critical") ||
          label.includes("hotfix")
      )
    );
  });

  if (urgentItems.length >= 1) {
    suggestions.push({
      id: "emergency",
      title: "Emergency",
      color: "#dc2626",
      priority: 0,
      confidence: 1.0,
    });
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      tasks: {},
      columns: defaultColumns,
      columnOrder: ["todo", "in-progress", "review", "done"],
      addedActionItemIds: new Set<string>(),

      syncFromGitHub: async () => {
        const { githubSettings } = useSettingsStore.getState();
        const { assignedItems, mentionItems, staleItems } =
          useActionItemsStore.getState();

        const selectedItems: ActionItem[] = [];

        if (githubSettings.assignedToMe) {
          selectedItems.push(...assignedItems);
        }

        if (githubSettings.mentionsMe) {
          selectedItems.push(...mentionItems);
        }

        const uniqueSelected = Array.from(
          new Map(selectedItems.map((i) => [i.id, i])).values()
        );
        console.log(
          `📋 Total ${uniqueSelected.length} unique action items found`
        );
        if (uniqueSelected.length === 0) {
          console.log("⚠️ No action items found!");
          return 0;
        }

        const contextData: GitHubDataContext = {
          assignedItems,
          mentionItems,
          staleItems,
          currentTime: new Date(),
          userSettings: githubSettings,
        };

        const contextSuggestions = analyzeContext(contextData);
        console.log("🧠 Context suggestions:", contextSuggestions);

        const newTasks: KanbanTask[] = uniqueSelected.map((item) => {
          const isReviewRequest =
            "mentionType" in item && item.mentionType === "review_request";
          const itemWithExtras = item as unknown as GitHubItemWithExtras;

          return {
            id: `action-${item.id}`,
            title: item.title,
            description: itemWithExtras.description?.substring(0, 200),
            type: item.type === "issue" ? "github-issue" : "github-pr",
            priority: isReviewRequest ? "high" : "medium",
            githubUrl: item.url,
            labels:
              itemWithExtras.labels?.map((l: { name: string }) => l.name) || [],
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt || item.createdAt),
          };
        });

        set((state) => {
          const existingTasks = { ...state.tasks };
          const updatedColumns = { ...state.columns };
          const newColumnOrder = [...state.columnOrder];

          Object.keys(existingTasks).forEach((taskId) => {
            if (taskId.startsWith("action-")) {
              delete existingTasks[taskId];
              Object.keys(updatedColumns).forEach((columnId) => {
                updatedColumns[columnId] = {
                  ...updatedColumns[columnId],
                  taskIds: updatedColumns[columnId].taskIds.filter(
                    (id) => id !== taskId
                  ),
                };
              });
            }
          });

          newTasks.forEach((task) => {
            existingTasks[task.id] = task;
            const targetColumn =
              contextSuggestions.length > 0 ? "todo" : "todo";
            updatedColumns[targetColumn] = {
              ...updatedColumns[targetColumn],
              taskIds: [...updatedColumns[targetColumn].taskIds, task.id],
            };
          });

          return {
            tasks: existingTasks,
            columns: updatedColumns,
            columnOrder: newColumnOrder,
          };
        });

        return newTasks.length;
      },

      addTask: (taskData) => {
        const { columnId, ...rest } = taskData;
        const id = `task-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const task: KanbanTask = {
          ...rest,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tasks: { ...state.tasks, [id]: task },
          columns: {
            ...state.columns,
            [columnId || "todo"]: {
              ...state.columns[columnId || "todo"],
              taskIds: [...state.columns[columnId || "todo"].taskIds, id],
            },
          },
        }));
      },

      addTaskFromActionItem: (item, notes, columnId = "todo") => {
        const id = `personal-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const task: KanbanTask = {
          id,
          title: item.title,
          description: `From: ${item.repo}${item.author ? ` (by ${item.author})` : ""}`,
          type: "personal",
          priority: item.priority,
          githubUrl: item.url,
          labels: [],
          notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => {
          const newAddedIds = new Set(state.addedActionItemIds);
          newAddedIds.add(item.id.toString());
          return {
            tasks: { ...state.tasks, [id]: task },
            columns: {
              ...state.columns,
              [columnId]: {
                ...state.columns[columnId],
                taskIds: [...state.columns[columnId].taskIds, id],
              },
            },
            addedActionItemIds: newAddedIds,
          };
        });
        return id;
      },

      isActionItemAdded: (itemId: string) => {
        return get().addedActionItemIds.has(itemId);
      },

      moveTask: (taskId, fromColumnId, toColumnId, newIndex) => {
        set((state) => {
          const fromColumn = state.columns[fromColumnId];
          const toColumn = state.columns[toColumnId];
          if (!fromColumn || !toColumn) return state;
          const fromTaskIds = [...fromColumn.taskIds];
          const toTaskIds =
            fromColumnId === toColumnId ? fromTaskIds : [...toColumn.taskIds];
          const taskIndex = fromTaskIds.indexOf(taskId);
          if (taskIndex < 0) return state;
          fromTaskIds.splice(taskIndex, 1);
          const insertAt = Math.max(0, Math.min(newIndex, toTaskIds.length));
          toTaskIds.splice(insertAt, 0, taskId);
          return {
            columns: {
              ...state.columns,
              [fromColumnId]: {
                ...fromColumn,
                taskIds: fromTaskIds,
              },
              [toColumnId]: {
                ...toColumn,
                taskIds: toTaskIds,
              },
            },
          };
        });
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              ...updates,
              updatedAt: new Date(),
            },
          },
        }));
      },

      deleteTask: (taskId) => {
        set((state) => {
          const newTasks = { ...state.tasks };
          delete newTasks[taskId];

          const newColumns = { ...state.columns };
          Object.keys(newColumns).forEach((columnId) => {
            newColumns[columnId] = {
              ...newColumns[columnId],
              taskIds: newColumns[columnId].taskIds.filter(
                (id) => id !== taskId
              ),
            };
          });

          return {
            tasks: newTasks,
            columns: newColumns,
          };
        });
      },

      clearGitHubTasks: () => {
        set((state) => {
          const personalTasks = Object.values(state.tasks)
            .filter((t) => t.type === "personal")
            .reduce((acc, task) => {
              acc[task.id] = task;
              return acc;
            }, {} as Record<string, KanbanTask>);

          const personalTaskIds = Object.keys(personalTasks);

          const resetColumns = Object.fromEntries(
            Object.entries(defaultColumns).map(([columnId, col]) => [
              columnId,
              {
                ...col,
                taskIds: personalTaskIds.filter(
                  (taskId) =>
                    state.columns[columnId]?.taskIds.includes(taskId) || false
                ),
              },
            ])
          ) as Record<string, KanbanColumn>;

          return {
            tasks: personalTasks,
            columns: resetColumns,
            columnOrder: ["todo", "in-progress", "review", "done"],
          };
        });
      },

      addColumn: (title, color) => {
        const id = `column-${Date.now()}`;
        set((state) => ({
          columns: {
            ...state.columns,
            [id]: {
              id,
              title,
              color,
              taskIds: [],
            },
          },
        }));
      },

      updateColumn: (id, updates) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [id]: {
              ...state.columns[id],
              ...updates,
            },
          },
        }));
      },

      deleteColumn: (id) => {
        set((state) => {
          const newColumns = { ...state.columns };
          delete newColumns[id];
          return {
            columns: newColumns,
            columnOrder: state.columnOrder.filter((colId) => colId !== id),
          };
        });
      },

      reorderColumns: (newOrder) => {
        set({ columnOrder: newOrder });
      },
    }),
    {
      name: "githubmon-kanban",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        tasks: state.tasks,
        columns: state.columns,
        columnOrder: state.columnOrder,
        addedActionItemIds: Array.from(state.addedActionItemIds),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.tasks) {
          for (const id of Object.keys(state.tasks)) {
            const t = state.tasks[id] as SerializedKanbanTask;
            if (t?.createdAt && typeof t.createdAt === "string")
              t.createdAt = new Date(t.createdAt);
            if (t?.updatedAt && typeof t.updatedAt === "string")
              t.updatedAt = new Date(t.updatedAt);
          }
        }

        if (Array.isArray(state.addedActionItemIds)) {
          state.addedActionItemIds = new Set(state.addedActionItemIds);
        } else if (!state.addedActionItemIds) {
          state.addedActionItemIds = new Set();
        }
      },
    }
  )
);
