"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { cn } from "@/lib/utils"

interface SwipeNavigationProps {
  children: React.ReactNode
}

export function SwipeNavigation({ children }: SwipeNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { direction, progress, isAnimating, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeNavigation()

  // Apply swipe navigation styles
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    if (direction && progress > 0) {
      container.style.transform = `translateX(${direction === "right" ? progress : -progress}px)`
    } else {
      container.style.transform = "translateX(0)"
    }

    container.style.transition = isAnimating ? "transform 0.3s ease" : "none"

    return () => {
      container.style.transform = ""
      container.style.transition = ""
    }
  }, [direction, progress, isAnimating])

  return (
    <div
      ref={containerRef}
      className={cn("w-full")}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}
