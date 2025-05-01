import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  withAuth?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  centered?: boolean
  withGutter?: boolean
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
  withAuth = true,
  maxWidth = "3xl",
  centered = false,
  withGutter = true,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    "3xl": "max-w-[1920px]", // Custom wider max-width
    full: "max-w-full",
  }

  const content = (
    <div
      className={cn(
        "w-full",
        !fullWidth && maxWidthClasses[maxWidth],
        !fullWidth && centered && "mx-auto",
        withGutter && "px-2 sm:px-3 md:px-4 lg:px-6",
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
