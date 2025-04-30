"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useMobile } from "./use-mobile"
import { useHapticContext } from "@/contexts/haptic-context"

// Define the navigation routes in order
const routes = ["/", "/emotional-log", "/breathe", "/thoughts", "/app-status", "/subscription"]

// Define additional routes that aren't in the main navigation flow
const additionalRoutes = ["/about", "/faq"]

interface SwipeState {
  swipeProgress: number
  swipeDirection: "left" | "right" | null
  isAnimating: boolean
  canSwipeLeft: boolean
  canSwipeRight: boolean
}

export function useSwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()
  const { isMobile, touchSupported } = useMobile()

  const [state, setState] = useState<SwipeState>({
    swipeProgress: 0,
    swipeDirection: null,
    isAnimating: false,
    canSwipeLeft: false,
    canSwipeRight: false,
  })

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const currentSwipe = useRef<number>(0)
  const isVerticalScroll = useRef<boolean>(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Determine if we can swipe in either direction based on current route
  const updateSwipeAvailability = useCallback(() => {
    if (!pathname) return

    const currentIndex = routes.indexOf(pathname)
    const isInMainRoutes = currentIndex !== -1

    // If we're not in the main routes, we can only swipe to go back to the previous page
    if (!isInMainRoutes) {
      setState((prev) => ({
        ...prev,
        canSwipeLeft: false,
        canSwipeRight: true, // Allow swiping right to go back
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      canSwipeLeft: currentIndex < routes.length - 1,
      canSwipeRight: currentIndex > 0,
    }))
  }, [pathname])

  useEffect(() => {
    updateSwipeAvailability()
  }, [pathname, updateSwipeAvailability])

  // Handle touch events for swipe navigation
  useEffect(() => {
    if (!isMobile || !touchSupported) return

    const handleTouchStart = (e: TouchEvent) => {
      // Store the initial touch position
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      isVerticalScroll.current = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return

      const touchX = e.touches[0].clientX
      const touchY = e.touches[0].clientY

      // Calculate horizontal and vertical distance moved
      const deltaX = touchX - touchStartX.current
      const deltaY = touchY - touchStartY.current

      // If we've determined this is a vertical scroll, don't process as a swipe
      if (isVerticalScroll.current) return

      // If we haven't yet determined direction and the vertical movement is greater,
      // mark this as a vertical scroll and exit
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && Math.abs(deltaY) > 10) {
        isVerticalScroll.current = true
        setState((prev) => ({ ...prev, swipeProgress: 0 }))
        return
      }

      // Check if we can swipe in the attempted direction
      if ((deltaX > 0 && !state.canSwipeRight) || (deltaX < 0 && !state.canSwipeLeft)) {
        // Reduce the swipe distance to indicate resistance
        currentSwipe.current = deltaX * 0.2
      } else {
        // Normal swipe
        currentSwipe.current = deltaX
      }

      // Update the swipe progress
      setState((prev) => ({
        ...prev,
        swipeProgress: currentSwipe.current,
        swipeDirection: deltaX > 0 ? "right" : "left",
      }))
    }

    const handleTouchEnd = () => {
      if (touchStartX.current === null || isVerticalScroll.current) {
        // Reset state
        touchStartX.current = null
        touchStartY.current = null
        isVerticalScroll.current = false
        setState((prev) => ({ ...prev, swipeProgress: 0 }))
        return
      }

      // Determine if the swipe was significant enough to navigate
      const swipeThreshold = window.innerWidth * 0.15 // 15% of screen width

      if (Math.abs(currentSwipe.current) > swipeThreshold) {
        // Determine direction and if we can navigate that way
        const direction = currentSwipe.current > 0 ? "right" : "left"
        const canNavigate = direction === "right" ? state.canSwipeRight : state.canSwipeLeft

        if (canNavigate) {
          // Set animating state
          setState((prev) => ({ ...prev, isAnimating: true }))

          // Provide haptic feedback if enabled
          if (settings.enabled) {
            haptic("medium")
          }

          // Navigate to the appropriate route
          const currentIndex = routes.indexOf(pathname || "/")

          if (currentIndex !== -1) {
            const nextIndex = direction === "right" ? currentIndex - 1 : currentIndex + 1
            if (nextIndex >= 0 && nextIndex < routes.length) {
              router.push(routes[nextIndex])
            }
          } else if (direction === "right" && additionalRoutes.includes(pathname || "")) {
            // If we're in an additional route and swiping right, go back
            router.back()
          }

          // Reset animation state after a delay
          if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current)
          }

          animationTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, isAnimating: false, swipeProgress: 0 }))
          }, 300)
        } else {
          // Can't navigate, reset swipe progress with animation
          setState((prev) => ({
            ...prev,
            swipeProgress: 0,
            isAnimating: false,
          }))
        }
      } else {
        // Swipe wasn't significant, reset
        setState((prev) => ({ ...prev, swipeProgress: 0 }))
      }

      // Reset touch tracking
      touchStartX.current = null
      touchStartY.current = null
      currentSwipe.current = 0
    }

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd)

    // Clean up
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isMobile, touchSupported, router, pathname, state.canSwipeLeft, state.canSwipeRight, haptic, settings])

  return state
}
