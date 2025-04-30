"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useNetworkStatus } from "@/utils/mobile-optimization"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
  disableSwipe?: boolean
  withRefresh?: boolean
  onRefresh?: () => Promise<void>
  scrollSnapType?: "none" | "y mandatory" | "y proximity"
}

export function PageContainer({
  children,
  className,
  fullHeight = false,
  disableSwipe = false,
  withRefresh = false,
  onRefresh,
  scrollSnapType = "none",
}: PageContainerProps) {
  const { swipeProgress, swipeDirection, isAnimating, canSwipeLeft, canSwipeRight } = useSwipeNavigation()
  const { isMobile, safeAreaInsets } = useMobile()
  const isOnline = useNetworkStatus()

  const containerRef = useRef<HTMLDivElement>(null)
  const refreshStartY = useRef<number | null>(null)
  const refreshing = useRef(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshProgress, setRefreshProgress] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Track scroll position and scrolling state
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const position = containerRef.current.scrollTop
    setScrollPosition(position)

    // Set scrolling state with debounce
    setIsScrolling(true)

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [])

  // Apply scroll optimizations
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

  // Handle pull-to-refresh functionality
  useEffect(() => {
    if (!withRefresh || !isMobile || !containerRef.current) return

    const container = containerRef.current

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the page
      if (container.scrollTop <= 0) {
        refreshStartY.current = e.touches[0].clientY
      } else {
        refreshStartY.current = null
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (refreshStartY.current === null || refreshing.current) return

      const touchY = e.touches[0].clientY
      const deltaY = touchY - refreshStartY.current

      // Only handle downward pulls when at the top
      if (deltaY > 0 && container.scrollTop <= 0) {
        // Calculate progress (0-100) with diminishing returns
        const progress = Math.min(100, Math.round((deltaY / 150) * 100))
        setRefreshProgress(progress)

        // Prevent default to disable browser's native pull-to-refresh
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (refreshStartY.current === null || refreshing.current) return

      // If pulled down enough, trigger refresh
      if (refreshProgress > 70 && onRefresh && isOnline) {
        refreshing.current = true
        setIsRefreshing(true)

        try {
          await onRefresh()
        } catch (error) {
          console.error("Refresh failed:", error)
        }

        // Reset after a minimum display time
        setTimeout(() => {
          refreshing.current = false
          setIsRefreshing(false)
          setRefreshProgress(0)
        }, 1000)
      } else {
        // Not pulled enough, reset
        setRefreshProgress(0)
      }

      refreshStartY.current = null
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [withRefresh, isMobile, onRefresh, refreshProgress, isOnline])

  return (
    <motion.main
      ref={containerRef}
      className={cn(
        "flex-1 relative overflow-x-hidden overflow-y-auto scroll-smooth",
        fullHeight ? "min-h-screen" : "",
        isScrolling ? "momentum-scroll" : "",
        className,
      )}
      animate={{
        x: isAnimating && !disableSwipe ? (swipeDirection === "left" ? "-5%" : "5%") : 0,
        opacity: isAnimating && !disableSwipe ? 0.8 : 1,
      }}
      transition={{ duration: 0.3 }}
      style={{
        transform: !isAnimating && !disableSwipe ? `translateX(${swipeProgress}px)` : undefined,
        paddingTop: `${safeAreaInsets.top}px`,
        paddingBottom: `${safeAreaInsets.bottom}px`,
        paddingLeft: `${safeAreaInsets.left}px`,
        paddingRight: `${safeAreaInsets.right}px`,
        scrollSnapType,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Pull-to-refresh indicator */}
      {withRefresh && (isMobile || isRefreshing) && (
        <div
          className={`absolute left-0 right-0 flex justify-center z-10 transition-transform duration-200 pointer-events-none`}
          style={{
            top: -60,
            transform: `translateY(${refreshProgress * 0.6}px)`,
            opacity: refreshProgress / 100,
          }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-md">
            {isRefreshing ? (
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronDown className="w-6 h-6 text-purple-500" />
            )}
          </div>
        </div>
      )}

      {/* Left swipe indicator */}
      {!disableSwipe && canSwipeLeft && (
        <motion.div
          className="fixed top-1/2 right-2 transform -translate-y-1/2 bg-purple-500/20 rounded-full p-2 z-50 pointer-events-none"
          animate={{
            opacity: swipeProgress < -20 ? 1 : 0,
            scale: swipeProgress < -20 ? 1.2 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-6 w-6 text-purple-600" />
        </motion.div>
      )}

      {/* Right swipe indicator */}
      {!disableSwipe && canSwipeRight && (
        <motion.div
          className="fixed top-1/2 left-2 transform -translate-y-1/2 bg-purple-500/20 rounded-full p-2 z-50 pointer-events-none"
          animate={{
            opacity: swipeProgress > 20 ? 1 : 0,
            scale: swipeProgress > 20 ? 1.2 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="h-6 w-6 text-purple-600" />
        </motion.div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="sticky top-0 bg-yellow-500 text-white text-center py-1 text-sm z-50">
          You're offline. Some features may be unavailable.
        </div>
      )}

      {/* Scroll to top button - appears when scrolled down */}
      {scrollPosition > 500 && (
        <button
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-40 bg-purple-600 text-white rounded-full p-3 shadow-lg opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Scroll to top"
        >
          <ChevronDown className="h-5 w-5 transform rotate-180" />
        </button>
      )}

      {children}
    </motion.main>
  )
}
