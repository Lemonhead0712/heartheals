"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingScreen } from "@/components/loading-screen"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { requiresLogin, isLoading, setIntendedDestination } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && typeof requiresLogin === "function" ? requiresLogin() : requiresLogin) {
      // Store the current path before redirecting
      setIntendedDestination(pathname)
      // Redirect to login with the current path as a parameter
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, requiresLogin, router, pathname, setIntendedDestination])

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  return <>{children}</>
}
