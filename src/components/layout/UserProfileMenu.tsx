"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface UserProfileMenuProps {
  username?: string;
  orgName?: string;
  isCollapsed?: boolean;
  onLogout: () => Promise<void>;
}

export function UserProfileMenu({
  username,
  orgName,
  isCollapsed = false,
  onLogout,
}: UserProfileMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const avatarContent = (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
      {username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
    </div>
  );

  if (isCollapsed) {
    return (
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <DropdownMenu>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    aria-label="User menu"
                  >
                    {avatarContent}
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{username}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{username}</p>
              <p className="text-xs text-muted-foreground">
                {orgName || "GitHub User"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-sidebar-border flex-shrink-0 space-y-2">
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-accent/30">
        {avatarContent}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{username}</div>
          <div className="text-xs text-muted-foreground truncate">
            {orgName || "GitHub User"}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="User menu"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
