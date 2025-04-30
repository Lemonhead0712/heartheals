"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseVirtualScrollOptions<T> {
  items: T[]
  itemHeight: number
  overscan?: number
  scrollingDelay?: number
}

interface UseVirtualScrollResult<T> {
  virtualItems: Array<{ index: number; item: T; offsetTop: number }>
  totalHeight: number
  containerProps: {
    ref: React.RefObject<HTMLDivElement>
    style: React.CSSProperties
    onScroll: (e: React.UIEvent) => void
  }
  scrollTo: (index: number) => void
  isScrolling: boolean
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  overscan = 3,
  scrollingDelay = 150,
}: UseVirtualScrollOptions<T>): UseVirtualScrollResult<T> {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback(
    (e: React.UIEvent) => {
      const scrollTop = e.currentTarget.scrollTop
      setScrollTop(scrollTop)

      // Set scrolling state with debounce
      setIsScrolling(true)

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
      }, scrollingDelay)
    },
    [scrollingDelay],
  )

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        setContainerHeight(entries[0].contentRect.height)
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }

    return undefined
  }, [])

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + containerHeight) / itemHeight) + overscan)

  const virtualItems = []

  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      index: i,
      item: items[i],
      offsetTop: i * itemHeight,
    })
  }

  const scrollTo = useCallback(
    (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight
      }
    },
    [itemHeight],
  )

  return {
    virtualItems,
    totalHeight,
    containerProps: {
      ref: containerRef,
      style: { position: "relative", height: "100%", overflow: "auto", WebkitOverflowScrolling: "touch" },
      onScroll: handleScroll,
    },
    scrollTo,
    isScrolling,
  }
}
