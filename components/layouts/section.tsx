import type React from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  title?: string
  description?: string
  fullWidth?: boolean
  centered?: boolean
  spacing?: "none" | "sm" | "md" | "lg"
}

export function Section({
  children,
  className,
  id,
  title,
  description,
  fullWidth = false,
  centered = false,
  spacing = "md",
}: SectionProps) {
  const spacingClasses = {
    none: "py-0",
    sm: "py-4 md:py-6",
    md: "py-6 md:py-8",
    lg: "py-8 md:py-12",
  }

  return (
    <section id={id} className={cn(spacingClasses[spacing], className)}>
      {(title || description) && (
        <div className={cn("mb-6", centered && "text-center")}>
          {title && <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h2>}
          {description && <p className="text-base md:text-lg text-muted-foreground max-w-3xl">{description}</p>}
        </div>
      )}
      <div className={cn(fullWidth ? "w-full" : "container", centered && "mx-auto")}>{children}</div>
    </section>
  )
}
