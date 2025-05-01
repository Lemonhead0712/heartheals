import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <AuthGuard>
      <main className={cn("flex-1", className)}>{children}</main>
    </AuthGuard>
  )
}
