"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingScreen } from "@/components/loading-screen"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { requiresLogin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requiresLogin()) {
      router.push("/login")
    }
  }, [isLoading, requiresLogin, router])

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  return <>{children}</>
}
