"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "./logo"

const affirmations = [
  "Healing takes time, and that's okay.",
  "Every breath is a step toward peace.",
  "You are stronger than you feel right now.",
  "Grief is love looking for a home.",
  "Even in sadness, hope patiently waits.",
]

export function LoadingScreen() {
  const [currentAffirmation, setCurrentAffirmation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmation((prev) => (prev + 1) % affirmations.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 z-50">
      <Logo size="large" textOverride="HeartsHeal" />

      <div className="h-16 mt-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentAffirmation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center text-lg text-purple-700 max-w-md px-4"
          >
            {affirmations[currentAffirmation]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex space-x-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
          className="w-3 h-3 rounded-full bg-pink-400"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5, delay: 0.5 }}
          className="w-3 h-3 rounded-full bg-blue-400"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5, delay: 1 }}
          className="w-3 h-3 rounded-full bg-purple-400"
        />
      </div>
    </div>
  )
}
