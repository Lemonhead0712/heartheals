"use client"

import type React from "react"

import { useScrollRestoration } from "@/hooks/use-scroll-restoration"

interface ScrollRestorationProviderProps {
  children: React.ReactNode
}

export function ScrollRestorationProvider({ children }: ScrollRestorationProviderProps) {
  useScrollRestoration()

  return <>{children}</>
}
