import { Button } from "@/components/ui/button";
import { useNavigationStore } from "@/stores";
import { Search } from "lucide-react";

interface SearchButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showShortcut?: boolean;
  className?: string;
}

export function SearchButton({
  variant = "outline",
  size = "default",
  showShortcut = true,
  className = "",
}: SearchButtonProps) {
  const { setCommandPaletteOpen } = useNavigationStore();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setCommandPaletteOpen(true)}
      className={`group ${className}`}
    >
      <Search className="h-4 w-4" />
      {size !== "icon" && (
        <>
          <span className="ml-2">Ara</span>
          {showShortcut && (
            <span className="ml-auto pl-3 text-xs text-muted-foreground group-hover:text-foreground">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                ⌘K
              </kbd>
            </span>
          )}
        </>
      )}
    </Button>
  );
}
