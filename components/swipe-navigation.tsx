"use client"

import type React from "react"

import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"

interface SwipeNavigationProps {
  children: React.ReactNode
  routes?: string[]
  routeLabels?: string[]
}

export function SwipeNavigation({
  children,
  routes = ["/", "/thoughts", "/breathe", "/emotional-log", "/app-status"],
  routeLabels = ["Home", "Thoughts", "Breathe", "Log", "Status"],
}: SwipeNavigationProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [showIndicators, setShowIndicators] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const {
    touchSurfaceRef,
    isAnimating,
    direction,
    canNavigateLeft,
    canNavigateRight,
    currentRouteIndex,
    navigateToRoute,
  } = useSwipeNavigation({ routes })

  // Hide indicators when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY + 10) {
        setShowIndicators(false)
      } else if (currentScrollY < lastScrollY - 10) {
        setShowIndicators(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Animation variants
  const pageVariants = {
    initial: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? "100%" : direction === "right" ? "-100%" : 0,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  return (
    <div className="relative h-full w-full overflow-hidden" ref={touchSurfaceRef}>
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation indicators */}
      <div
        className={cn(
          "fixed bottom-20 left-0 right-0 z-40 flex justify-center transition-opacity duration-300",
          showIndicators ? "opacity-100" : "opacity-0 pointer-events-none",
          isMobile ? "mb-4" : "mb-8",
        )}
      >
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-md">
          {routes.map((route, index) => (
            <div
              key={route}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                pathname === route ? "bg-purple-600 w-4" : "bg-gray-300 hover:bg-gray-400",
              )}
            />
          ))}
        </div>
      </div>

      {/* Navigation arrows (desktop only) */}
      {!isMobile && (
        <>
          {canNavigateRight && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "fixed left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white/90 transition-opacity duration-300",
                showIndicators ? "opacity-80 hover:opacity-100" : "opacity-0 pointer-events-none",
              )}
              onClick={() => navigateToRoute("right")}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous</span>
            </Button>
          )}

          {canNavigateLeft && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "fixed right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white/90 transition-opacity duration-300",
                showIndicators ? "opacity-80 hover:opacity-100" : "opacity-0 pointer-events-none",
              )}
              onClick={() => navigateToRoute("left")}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next</span>
            </Button>
          )}
        </>
      )}

      {/* Swipe hint overlay (mobile only, shown on first visit) */}
      <SwipeHintOverlay />
    </div>
  )
}

// Swipe hint overlay component
function SwipeHintOverlay() {
  const isMobile = useMobile()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Only show hint on mobile and if it hasn't been shown before
    if (isMobile) {
      const hasSeenHint = localStorage.getItem("heartsHeal_swipeHintSeen")
      if (!hasSeenHint) {
        setShowHint(true)
        localStorage.setItem("heartsHeal_swipeHintSeen", "true")

        // Hide hint after 3 seconds
        const timer = setTimeout(() => {
          setShowHint(false)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [isMobile])

  if (!showHint) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowHint(false)}
    >
      <motion.div
        className="flex flex-col items-center gap-4 text-white"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <div className="flex items-center gap-6">
          <motion.div
            className="text-3xl"
            animate={{ x: [-20, 20, -20] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            👈
          </motion.div>
          <motion.div
            className="text-3xl"
            animate={{ x: [20, -20, 20] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            👉
          </motion.div>
        </div>
        <p className="text-lg font-medium text-center">Swipe left or right to navigate between pages</p>
        <p className="text-sm opacity-80">Tap anywhere to dismiss</p>
      </motion.div>
    </motion.div>
  )
}
