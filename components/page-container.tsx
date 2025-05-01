import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  withAuth?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  centered?: boolean
  withGutter?: boolean
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
  withAuth = true,
  maxWidth = "2xl",
  centered = false,
  withGutter = true,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }

  const content = (
    <div
      className={cn(
        "w-full",
        !fullWidth && maxWidthClasses[maxWidth],
        !fullWidth && centered && "mx-auto",
        withGutter && "px-4 sm:px-6 md:px-8",
        className,
      )}
    >
      {children}
    </div>
  )

  if (withAuth) {
    return <AuthGuard>{content}</AuthGuard>
  }

  return content
}
