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
}

export function Section({
  children,
  className,
  id,
  title,
  description,
  fullWidth = false,
  centered = false,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-8 md:py-12", className)}>
      {(title || description) && (
        <div className={cn("mb-8", centered && "text-center")}>
          {title && <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">{title}</h2>}
          {description && <p className="text-lg text-muted-foreground max-w-3xl">{description}</p>}
        </div>
      )}
      <div className={cn(fullWidth ? "w-full" : "container", centered && "mx-auto")}>{children}</div>
    </section>
  )
}
