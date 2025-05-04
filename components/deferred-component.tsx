"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface DeferredComponentProps {
  children: React.ReactNode
  delay?: number
  placeholder?: React.ReactNode
  priority?: "low" | "medium" | "high"
}

/**
 * DeferredComponent - Delays rendering of children until after initial page load
 * Useful for non-critical UI elements to improve initial page load performance
 */
export default function DeferredComponent({
  children,
  delay = 1000,
  placeholder = <div className="min-h-[50px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
  priority = "medium",
}: DeferredComponentProps) {
  const [isClient, setIsClient] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Adjust delay based on priority
  const actualDelay = priority === "high" ? delay / 2 : priority === "low" ? delay * 2 : delay

  useEffect(() => {
    setIsClient(true)

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(() => {
        setTimeout(() => setShouldRender(true), actualDelay)
      })

      return () => (window as any).cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(() => setShouldRender(true), actualDelay)
      return () => clearTimeout(timer)
    }
  }, [actualDelay])

  // Always render children on server to ensure SEO
  if (!isClient) return <>{children}</>

  return shouldRender ? <>{children}</> : <>{placeholder}</>
}
