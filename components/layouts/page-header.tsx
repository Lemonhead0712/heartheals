import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  centered?: boolean
}

export function PageHeader({ title, description, children, className, centered = false }: PageHeaderProps) {
  return (
    <div className={cn("mb-10", centered && "text-center", className)}>
      <h1 className="font-playfair text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {description && <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
