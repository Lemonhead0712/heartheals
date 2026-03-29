import type React from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Constrains content to max-w-5xl centered. Default: true */
  constrain?: boolean
}

export function PageContainer({ children, className, constrain = true }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen bg-page-gradient", className)}>
      <div className={cn(constrain && "max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-10 md:pt-10 md:pb-16")}>
        {children}
      </div>
    </div>
  )
}
