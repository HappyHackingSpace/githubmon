"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarGroupProps {
  icon?: LucideIcon;
  title: string;
  isCollapsed?: boolean;
  className?: string;
}

export function SidebarGroup({
  icon: Icon,
  title,
  isCollapsed = false,
  className = "",
}: SidebarGroupProps) {
  if (isCollapsed) {
    return <div className="h-px bg-slate-800 my-4 mx-4" />;
  }

  return (
    <div
      className={cn(
        "px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2 mt-4",
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 opacity-70" />}
      <span>{title}</span>
    </div>
  );
}
