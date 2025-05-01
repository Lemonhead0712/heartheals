import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  centered?: boolean
  compact?: boolean
}

export function PageHeader({
  title,
  description,
  children,
  className,
  centered = false,
  compact = false,
}: PageHeaderProps) {
  return (
    <div className={cn(compact ? "mb-6" : "mb-8", centered && "text-center", className)}>
      <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {description && (
        <p className={cn("text-muted-foreground max-w-3xl", compact ? "mt-2 text-base" : "mt-3 text-lg")}>
          {description}
        </p>
      )}
      {children && <div className={compact ? "mt-4" : "mt-5"}>{children}</div>}
    </div>
  )
}
