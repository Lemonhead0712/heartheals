"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { swipeProgress, swipeDirection, isAnimating, canSwipeLeft, canSwipeRight } = useSwipeNavigation()

  return (
    <motion.main
      className={cn("flex-1 relative overflow-hidden", className)}
      animate={{
        x: isAnimating ? (swipeDirection === "left" ? "-5%" : "5%") : 0,
        opacity: isAnimating ? 0.8 : 1,
      }}
      transition={{ duration: 0.3 }}
      style={{
        transform: !isAnimating ? `translateX(${swipeProgress}px)` : undefined,
      }}
    >
      {/* Left swipe indicator */}
      {canSwipeLeft && (
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
      {canSwipeRight && (
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

      {children}
    </motion.main>
  )
}
