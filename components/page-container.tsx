"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

// Define consistent container sizes that match application standards
const CONTAINER_SIZES = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "3xl": "max-w-[1920px]",
  full: "max-w-full",
} as const

// Define consistent spacing options
const SPACING_OPTIONS = {
  none: "p-0",
  sm: "px-2 sm:px-3 md:px-4",
  md: "px-3 sm:px-4 md:px-6",
  lg: "px-4 sm:px-6 md:px-8",
} as const

export interface PageContainerProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  withAuth?: boolean
  maxWidth?: keyof typeof CONTAINER_SIZES
  centered?: boolean
  spacing?: keyof typeof SPACING_OPTIONS | boolean
  fillEmptyRoutes?: boolean
  fallbackRoute?: string
}

/**
 * PageContainer - A consistent container for page content
 *
 * Provides standardized width constraints, spacing, and authentication
 * guards for page content throughout the application.
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
  withAuth = true,
  maxWidth = "3xl",
  centered = false,
  spacing = "md",
  fillEmptyRoutes = true,
  fallbackRoute = "/",
}: PageContainerProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Handle empty routes by redirecting to fallback
  useEffect(() => {
    if (fillEmptyRoutes && pathname === "/404") {
      router.push(fallbackRoute)
    }
  }, [pathname, router, fillEmptyRoutes, fallbackRoute])

  // Determine spacing classes based on the spacing prop
  const spacingClasses =
    spacing === true ? SPACING_OPTIONS.md : spacing === false ? SPACING_OPTIONS.none : SPACING_OPTIONS[spacing]

  const content = (
    <div
      className={cn(
        "w-full",
        !fullWidth && CONTAINER_SIZES[maxWidth],
        !fullWidth && centered && "mx-auto",
        spacingClasses,
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
