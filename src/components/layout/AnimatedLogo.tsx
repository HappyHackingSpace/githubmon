"use client";

import { Github } from "lucide-react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export function AnimatedLogo({ size = 24, className = "" }: AnimatedLogoProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Github
        className="w-full h-full text-sidebar-foreground transition-transform duration-300 hover:scale-110"
        aria-hidden="true"
      />
    </div>
  );
}
