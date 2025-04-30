"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ScrollableContainerProps {
  children: React.ReactNode
  className?: string
  maxHeight?: string | number
  hideScrollbar?: boolean
  onScroll?: (position: number) => void
  scrollSnapType?: "none" | "y mandatory" | "y proximity"
}

export function ScrollableContainer({
  children,
  className,
  maxHeight = "100%",
  hideScrollbar = false,
  onScroll,
  scrollSnapType = "none",
}: ScrollableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const position = containerRef.current.scrollTop

    if (onScroll) {
      onScroll(position)
    }

    // Set scrolling state with debounce
    setIsScrolling(true)

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [onScroll])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add passive scroll listener for performance
    container.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      container.removeEventListener("scroll", handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [handleScroll])

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-y-auto overflow-x-hidden",
        hideScrollbar && "scrollbar-hide",
        isScrolling ? "momentum-scroll" : "scroll-smooth",
        className,
      )}
      style={{
        maxHeight,
        scrollSnapType,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  )
}
