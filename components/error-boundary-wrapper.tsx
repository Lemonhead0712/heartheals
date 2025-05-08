"use client"

import type React from "react"

import { ErrorBoundary } from "@/components/error-boundary"

export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div className="p-4 text-red-500">Something went wrong. Please try refreshing the page.</div>}
    >
      {children}
    </ErrorBoundary>
  )
}
