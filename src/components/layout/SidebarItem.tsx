import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  text: string;
  href?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  chevron?: ReactNode;
  className?: string;
}

export function SidebarItem({
  icon: Icon,
  text,
  href,
  isActive = false,
  isCollapsed = false,
  onClick,
  badge,
  chevron,
  className = "",
}: SidebarItemProps) {
  const baseClasses = cn(
    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
    "text-sm font-medium transition-all duration-200 group",
    isActive
      ? "bg-primary/10 text-primary shadow-sm"
      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100",
    isCollapsed ? "justify-center" : "",
    className
  );

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={cn(
        "shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-200",
        !isActive && "group-hover:scale-110"
      )}>
        <Icon
          className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")}
          aria-hidden="true"
        />
      </div>
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{text}</span>
          {badge && <div className="flex items-center gap-1">{badge}</div>}
          {chevron && (
            <div className="transition-transform duration-200">
              {chevron}
            </div>
          )}
        </>
      )}
      {isCollapsed && <span className="sr-only">{text}</span>}
    </>
  );

  const renderLinkOrButton = () => {
    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  };

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-2">
              {renderLinkOrButton()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-slate-100">
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="px-2">
      {renderLinkOrButton()}
    </div>
  );
}
