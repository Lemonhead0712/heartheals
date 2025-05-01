"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

interface SwipeOptions {
  threshold?: number // minimum distance required for a swipe (px)
  timeout?: number // maximum time allowed for a swipe (ms)
  preventDefaultTouchmoveEvent?: boolean
  preventSwipeOnVertical?: boolean
  routes?: string[] // ordered array of routes for navigation
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipeNavigation({
  threshold = 50,
  timeout = 500,
  preventDefaultTouchmoveEvent = true,
  preventSwipeOnVertical = true,
  routes = ["/", "/thoughts", "/breathe", "/emotional-log", "/app-status"],
  onSwipeLeft,
  onSwipeRight,
}: SwipeOptions = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const touchSurfaceRef = useRef<HTMLDivElement>(null)

  // Find current route index
  const currentRouteIndex = routes.indexOf(pathname)

  // Determine if we can navigate left or right
  const canNavigateLeft = currentRouteIndex < routes.length - 1
  const canNavigateRight = currentRouteIndex > 0

  // Reset touch states
  const resetTouchState = () => {
    setTouchStart(null)
    setTouchEnd(null)
    setDirection(null)
  }

  // Handle navigation
  const navigateToRoute = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating) return

      let nextRouteIndex: number

      if (direction === "left" && canNavigateLeft) {
        nextRouteIndex = currentRouteIndex + 1
        onSwipeLeft?.()
      } else if (direction === "right" && canNavigateRight) {
        nextRouteIndex = currentRouteIndex - 1
        onSwipeRight?.()
      } else {
        return
      }

      if (nextRouteIndex >= 0 && nextRouteIndex < routes.length) {
        setIsAnimating(true)
        setDirection(direction)

        // Navigate to the next route
        router.push(routes[nextRouteIndex])

        // Reset animation state after transition
        setTimeout(() => {
          setIsAnimating(false)
          setDirection(null)
        }, 300)
      }
    },
    [currentRouteIndex, canNavigateLeft, canNavigateRight, isAnimating, onSwipeLeft, onSwipeRight, router, routes],
  )

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null) // reset touch end
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    })
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStart) return

      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
        time: Date.now(),
      })

      // Prevent default only if we're swiping horizontally
      if (preventDefaultTouchmoveEvent) {
        const deltaX = touchStart.x - e.targetTouches[0].clientX
        const deltaY = touchStart.y - e.targetTouches[0].clientY

        // If horizontal movement is greater than vertical, prevent default
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault()
        }
      }
    },
    [preventDefaultTouchmoveEvent, touchStart],
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    // Calculate time and distance
    const deltaTime = touchEnd.time - touchStart.time
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y

    // Check if swipe meets time and distance requirements
    const isSwipe = deltaTime < timeout && Math.abs(deltaX) > threshold

    // Check if vertical movement is minimal enough to be considered a horizontal swipe
    const isHorizontalSwipe = !preventSwipeOnVertical || Math.abs(deltaY) < Math.abs(deltaX) * 0.8

    if (isSwipe && isHorizontalSwipe) {
      if (deltaX > 0) {
        // Swipe left
        navigateToRoute("left")
      } else {
        // Swipe right
        navigateToRoute("right")
      }
    }

    resetTouchState()
  }, [threshold, timeout, preventSwipeOnVertical, touchStart, touchEnd, navigateToRoute])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateToRoute("right") // Right is previous in our context
      } else if (e.key === "ArrowRight") {
        navigateToRoute("left") // Left is next in our context
      }
    },
    [navigateToRoute],
  )

  // Set up event listeners
  useEffect(() => {
    const touchSurface = touchSurfaceRef.current

    if (touchSurface) {
      touchSurface.addEventListener("touchstart", handleTouchStart, { passive: false })
      touchSurface.addEventListener("touchmove", handleTouchMove, { passive: false })
      touchSurface.addEventListener("touchend", handleTouchEnd, { passive: false })
    }

    // Add keyboard navigation
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      if (touchSurface) {
        touchSurface.removeEventListener("touchstart", handleTouchStart)
        touchSurface.removeEventListener("touchmove", handleTouchMove)
        touchSurface.removeEventListener("touchend", handleTouchEnd)
      }
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    touchSurfaceRef,
    isAnimating,
    direction,
    canNavigateLeft,
    canNavigateRight,
    currentRouteIndex,
    navigateToRoute,
  }
}
