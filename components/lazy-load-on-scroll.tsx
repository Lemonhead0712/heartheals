"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface LazyLoadOnScrollProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  placeholder?: React.ReactNode
  onVisible?: () => void
}

export function LazyLoadOnScroll({
  children,
  className,
  threshold = 0.1,
  rootMargin = "100px",
  placeholder,
  onVisible,
}: LazyLoadOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setIsVisible(true)
        if (onVisible) {
          onVisible()
        }
      }
    },
    [onVisible],
  )

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [handleIntersection, rootMargin, threshold])

  return (
    <div ref={ref} className={cn("min-h-[50px]", className)}>
      {isVisible ? children : placeholder || <div className="animate-pulse bg-gray-200 h-full w-full rounded" />}
    </div>
  )
}
