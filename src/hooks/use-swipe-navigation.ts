"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface SwipeState {
  startX: number
  currentX: number
  direction: "left" | "right" | null
}

export function useSwipeNavigation() {
  const router = useRouter()
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    direction: null,
  })
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculate swipe progress (0-100)
  const progress = Math.min(Math.abs(swipeState.currentX - swipeState.startX), 100)

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setSwipeState({
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      direction: null,
    })
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const currentX = e.touches[0].clientX
      const diff = currentX - swipeState.startX

      setSwipeState((prev) => ({
        ...prev,
        currentX,
        direction: diff > 0 ? "right" : "left",
      }))
    },
    [swipeState.startX],
  )

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    const { direction } = swipeState

    // If swipe distance is significant (> 50px), navigate
    if (progress > 50 && direction) {
      setIsAnimating(true)

      // Navigate based on swipe direction
      if (direction === "right") {
        // Go back in history
        router.back()
      } else if (direction === "left") {
        // Could implement forward navigation or other action
        // For now, we'll just reset
      }

      // Reset after animation
      setTimeout(() => {
        setSwipeState({
          startX: 0,
          currentX: 0,
          direction: null,
        })
        setIsAnimating(false)
      }, 300)
    } else {
      // Reset immediately if swipe wasn't significant
      setSwipeState({
        startX: 0,
        currentX: 0,
        direction: null,
      })
    }
  }, [progress, router, swipeState])

  return {
    direction: swipeState.direction,
    progress,
    isAnimating,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
