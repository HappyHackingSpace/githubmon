import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SubMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
  isActive?: boolean;
}

interface SubMenuFlyoutProps {
  icon: LucideIcon;
  label: string;
  items: SubMenuItem[];
  totalBadge?: string | number;
  isActive?: boolean;
}

export function SubMenuFlyout({
  icon: Icon,
  label,
  items,
  totalBadge,
  isActive = false,
}: SubMenuFlyoutProps) {
  return (
    <div className="relative group px-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 justify-center",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              )}
            >
              <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} aria-hidden="true" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-slate-100">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="absolute left-full top-0 ml-4 hidden group-hover:block z-50 min-w-[220px]">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl py-3 px-2 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center justify-between border-b border-slate-800/50 mb-2">
            <span>{label}</span>
            {totalBadge !== undefined && (
              <Badge
                variant="outline"
                className="text-[10px] min-w-[1.25rem] h-4 bg-primary/10 text-primary border-primary/20"
              >
                {totalBadge}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium group/item",
                  item.isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-transform duration-200", !item.isActive && "group-hover/item:scale-110")} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-auto text-[10px] h-4 min-w-[1rem] flex items-center justify-center",
                      item.isActive ? "bg-primary text-primary-foreground border-transparent" : "bg-slate-800 border-slate-700"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
