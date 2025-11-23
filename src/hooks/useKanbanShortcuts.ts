import { useEffect } from "react";
import { toast } from "sonner";

interface ShortcutHandlers {
  onNewTask?: () => void;
  onSync?: () => void;
  onClear?: () => void;
  onSearch?: () => void;
  onArchive?: () => void;
  onHelp?: () => void;
}

export function useKanbanShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isInput =
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable;

      if ((e.ctrlKey || e.metaKey) && !isInput) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            handlers.onNewTask?.();
            break;
          case "k":
            e.preventDefault();
            handlers.onSearch?.();
            break;
          case "r":
            e.preventDefault();
            handlers.onSync?.();
            break;
          case "l":
            e.preventDefault();
            handlers.onClear?.();
            break;
          case "e":
            e.preventDefault();
            handlers.onArchive?.();
            break;
        }
      }

      if (e.key === "?" && !isInput) {
        e.preventDefault();
        handlers.onHelp?.();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handlers]);
}

export function showKeyboardShortcutsHelp() {
  toast.info("Keyboard Shortcuts", {
    description: [
      "Ctrl+N - New task",
      "Ctrl+K - Search",
      "Ctrl+R - Sync from GitHub",
      "Ctrl+E - Toggle archive",
      "? - Show this help"
    ].join(" | "),
    duration: 8000,
  });
}
