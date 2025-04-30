"use client"

import { useRef, useState, useEffect } from "react"

interface UseChartGesturesProps {
  minZoom?: number
  maxZoom?: number
  onZoomChange?: (zoom: number) => void
}

export function useChartGestures({ minZoom = 1, maxZoom = 5, onZoomChange }: UseChartGesturesProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isPinching, setIsPinching] = useState(false)
  const lastDistance = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Handle touch events for pinch zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return

      // Calculate initial distance between two touch points
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastDistance.current = Math.sqrt(dx * dx + dy * dy)
      setIsPinching(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPinching || e.touches.length !== 2 || lastDistance.current === null) return

      // Calculate new distance
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Calculate zoom factor
      const delta = distance / lastDistance.current
      const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * delta))

      setZoom(newZoom)
      onZoomChange?.(newZoom)
      lastDistance.current = distance
    }

    const handleTouchEnd = () => {
      setIsPinching(false)
      lastDistance.current = null
    }

    // Add event listeners
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchmove", handleTouchMove)
    container.addEventListener("touchend", handleTouchEnd)
    container.addEventListener("touchcancel", handleTouchEnd)

    // Clean up
    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [zoom, isPinching, minZoom, maxZoom, onZoomChange])

  return {
    containerRef,
    zoom,
    isPinching,
    resetZoom: () => setZoom(1),
  }
}
