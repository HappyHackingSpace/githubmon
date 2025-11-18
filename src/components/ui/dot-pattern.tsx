"use client"

import { cn } from "@/lib/utils"

interface DotPatternProps {
  className?: string
  dotSize?: number
  dotColor?: string
  gap?: number
}

export function DotPattern({
  className,
  dotSize = 1,
  dotColor = "rgba(156, 163, 175, 0.2)",
  gap = 20,
}: DotPatternProps) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  )
}
