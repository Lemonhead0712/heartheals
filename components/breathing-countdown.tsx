"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

    // Sound feedback removed
    // Visual countdown will still work as before
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
        className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400/80 via-blue-500/80 to-indigo-600/80 backdrop-blur-md z-50"
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
          {/* Wave animation for countdown */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Generate multiple wave rings for countdown */}
            {[0.5, 0.65, 0.8, 0.95, 1.1].map((scale, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/30"
                style={{
                  width: `${scale * 200}px`,
                  height: `${scale * 200}px`,
                  top: "50%",
                  left: "50%",
                  marginLeft: `-${scale * 100}px`,
                  marginTop: `-${scale * 100}px`,
                }}
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.3 + i * 0.1, 0.5 + i * 0.1, 0.3 + i * 0.1],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Central count display */}
            <motion.div
              key={count}
              className="relative z-10 flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-8xl font-bold text-white">{count > 0 ? count : "Begin"}</div>
            </motion.div>
          </div>

          <motion.div
            className="text-xl text-white/80 mt-4"
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
