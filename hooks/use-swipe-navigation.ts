"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useHaptic } from "@/hooks/use-haptic"
import { useMobile } from "@/hooks/use-mobile"

// Define the main navigation routes in order
const mainRoutes = ["/", "/emotional-log", "/breathe", "/thoughts", "/subscription"]

// Threshold for swipe distance to trigger navigation (in pixels)
const SWIPE_THRESHOLD = 100
// Threshold for swipe velocity to trigger navigation (in pixels per ms)
const VELOCITY_THRESHOLD = 0.5

type SwipeDirection = "left" | "right" | null

export function useSwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { triggerHaptic } = useHaptic()
  const { isMobile } = useMobile()

  const [swipeProgress, setSwipeProgress] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [canSwipeLeft, setCanSwipeLeft] = useState(false)
  const [canSwipeRight, setCanSwipeRight] = useState(false)

  // Refs for touch handling
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndX = useRef(0)
  const touchStartTime = useRef(0)
  const isSwiping = useRef(false)

  // Determine available navigation directions based on current route
  useEffect(() => {
    const currentIndex = mainRoutes.indexOf(pathname)

    // If the current path isn't in our main routes, disable swipe navigation
    if (currentIndex === -1) {
      setCanSwipeLeft(false)
      setCanSwipeRight(false)
      return
    }

    setCanSwipeLeft(currentIndex < mainRoutes.length - 1)
    setCanSwipeRight(currentIndex > 0)
  }, [pathname])

  // Navigate to the next or previous route
  const navigateToRoute = (direction: "left" | "right") => {
    const currentIndex = mainRoutes.indexOf(pathname)
    if (currentIndex === -1) return

    let targetIndex
    if (direction === "left" && currentIndex < mainRoutes.length - 1) {
      targetIndex = currentIndex + 1
    } else if (direction === "right" && currentIndex > 0) {
      targetIndex = currentIndex - 1
    } else {
      return
    }

    // Trigger haptic feedback
    triggerHaptic("medium")

    // Animate the transition
    setIsAnimating(true)
    setSwipeDirection(direction)

    // Navigate after a short delay to allow animation to play
    setTimeout(() => {
      router.push(mainRoutes[targetIndex])

      // Reset animation state after navigation
      setTimeout(() => {
        setIsAnimating(false)
        setSwipeDirection(null)
        setSwipeProgress(0)
      }, 300)
    }, 200)
  }

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (!isMobile) return

    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    isSwiping.current = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isMobile || !isSwiping.current) return

    touchEndX.current = e.touches[0].clientX

    // Calculate horizontal and vertical distance
    const deltaX = touchEndX.current - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current

    // If vertical scrolling is more prominent, don't interfere
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isSwiping.current = false
      setSwipeProgress(0)
      return
    }

    // Determine if we can swipe in this direction
    if ((deltaX > 0 && !canSwipeRight) || (deltaX < 0 && !canSwipeLeft)) {
      // Allow some resistance when swiping beyond edges
      setSwipeProgress(deltaX / 5)
      return
    }

    // Calculate swipe progress as percentage of screen width
    const screenWidth = window.innerWidth
    const progress = (deltaX / screenWidth) * 100

    // Limit progress to a reasonable range
    const clampedProgress = Math.max(Math.min(progress, 40), -40)
    setSwipeProgress(clampedProgress)

    // Set swipe direction for visual feedback
    setSwipeDirection(deltaX > 0 ? "right" : "left")
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isMobile || !isSwiping.current) return

    isSwiping.current = false

    const deltaX = touchEndX.current - touchStartX.current
    const timeDelta = Date.now() - touchStartTime.current
    const velocity = Math.abs(deltaX) / timeDelta

    // Reset swipe progress
    setSwipeProgress(0)

    // Check if swipe was fast or far enough to trigger navigation
    if (Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      if (deltaX > 0 && canSwipeRight) {
        navigateToRoute("right")
      } else if (deltaX < 0 && canSwipeLeft) {
        navigateToRoute("left")
      }
    } else {
      // Reset direction if swipe wasn't completed
      setSwipeDirection(null)
    }
  }

  // Set up event listeners
  useEffect(() => {
    if (!isMobile) return

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, canSwipeLeft, canSwipeRight])

  return {
    swipeProgress,
    swipeDirection,
    isAnimating,
    canSwipeLeft,
    canSwipeRight,
  }
}
