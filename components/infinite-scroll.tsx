"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface InfiniteScrollProps {
  children: React.ReactNode
  className?: string
  loadMore: () => Promise<void>
  hasMore: boolean
  threshold?: number
  loadingIndicator?: React.ReactNode
  endMessage?: React.ReactNode
}

export function InfiniteScroll({
  children,
  className,
  loadMore,
  hasMore,
  threshold = 200,
  loadingIndicator = <div className="py-4 text-center">Loading more...</div>,
  endMessage = <div className="py-4 text-center text-gray-500">No more items to load</div>,
}: InfiniteScrollProps) {
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        loadMoreItems()
      }
    },
    [hasMore, loading],
  )

  const loadMoreItems = useCallback(async () => {
    if (!hasMore || loading) return

    setLoading(true)
    try {
      await loadMore()
    } catch (error) {
      console.error("Error loading more items:", error)
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    const currentSentinel = sentinelRef.current
    if (!currentSentinel) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: `0px 0px ${threshold}px 0px`,
    })

    observerRef.current.observe(currentSentinel)

    return () => {
      if (observerRef.current && currentSentinel) {
        observerRef.current.unobserve(currentSentinel)
      }
    }
  }, [handleObserver, threshold])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {children}
      <div ref={sentinelRef} className="h-1 w-full" />
      {loading && loadingIndicator}
      {!hasMore && !loading && endMessage}
    </div>
  )
}
