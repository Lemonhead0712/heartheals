"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export function SwipeNavigationTutorial() {
  const [showTutorial, setShowTutorial] = useState(false)
  const { isMobile } = useMobile()

  useEffect(() => {
    // Only show on mobile devices and only if the user hasn't seen it before
    if (isMobile) {
      const hasSeenTutorial = localStorage.getItem("heartsHeal_swipeTutorialSeen")
      if (!hasSeenTutorial) {
        // Show tutorial after a short delay
        const timer = setTimeout(() => {
          setShowTutorial(true)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }
  }, [isMobile])

  const dismissTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem("heartsHeal_swipeTutorialSeen", "true")
  }

  if (!showTutorial) return null

  return (
    <motion.div
      className="fixed bottom-20 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={dismissTutorial}>
        <X className="h-4 w-4" />
      </Button>

      <h3 className="text-lg font-medium text-purple-800 mb-2">New Feature: Swipe Navigation</h3>

      <div className="flex items-center justify-center gap-4 my-4">
        <motion.div
          animate={{
            x: [0, -10, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            duration: 1.5,
          }}
        >
          <ChevronLeft className="h-6 w-6 text-purple-600" />
        </motion.div>

        <p className="text-sm text-center text-purple-600">Swipe left or right to navigate between pages</p>

        <motion.div
          animate={{
            x: [0, 10, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            duration: 1.5,
          }}
        >
          <ChevronRight className="h-6 w-6 text-purple-600" />
        </motion.div>
      </div>

      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={dismissTutorial}>
        Got it
      </Button>
    </motion.div>
  )
}
