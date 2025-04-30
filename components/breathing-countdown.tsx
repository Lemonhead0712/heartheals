"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createBeepSound } from "@/lib/audio-utils"

interface BreathingCountdownProps {
  isActive: boolean
  onComplete: () => void
  soundEnabled: boolean
}

export function BreathingCountdown({ isActive, onComplete, soundEnabled }: BreathingCountdownProps) {
  const [count, setCount] = useState(3)
  const [isRunning, setIsRunning] = useState(false)

  // Play different tones for each count
  const playCountSound = (currentCount: number) => {
    if (!soundEnabled) return

    // Higher pitch for each count, with the highest for "Begin"
    switch (currentCount) {
      case 3:
        createBeepSound(400, 200, 0.4)()
        break
      case 2:
        createBeepSound(500, 200, 0.4)()
        break
      case 1:
        createBeepSound(600, 200, 0.4)()
        break
      case 0: // "Begin" sound
        createBeepSound(700, 300, 0.5)()
        break
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isActive && !isRunning) {
      setIsRunning(true)
      setCount(3)
      playCountSound(3)
    }

    if (isRunning) {
      if (count > 0) {
        timer = setTimeout(() => {
          setCount(count - 1)
          playCountSound(count - 1)
        }, 1000)
      } else {
        // When count reaches 0, complete the countdown
        setTimeout(() => {
          setIsRunning(false)
          onComplete()
        }, 1000) // Show "Begin" for 1 second before starting
      }
    }

    return () => clearTimeout(timer)
  }, [isActive, isRunning, count, onComplete, soundEnabled])

  if (!isRunning) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-8xl font-bold text-white mb-4"
          >
            {count > 0 ? count : "Begin"}
          </motion.div>
          <motion.div
            className="text-xl text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {count > 0 ? "Get ready..." : "Take a deep breath"}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
