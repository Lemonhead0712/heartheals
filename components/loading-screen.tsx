"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "./logo"

const affirmations = [
  "Healing takes time, and that is okay.",
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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-page-gradient z-50">
      <Logo size="large" />

      <div className="h-16 mt-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentAffirmation}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="text-center text-lg font-serif italic text-muted-foreground max-w-md px-4"
          >
            {affirmations[currentAffirmation]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.3,
              delay: i * 0.3,
            }}
            className="w-2.5 h-2.5 rounded-full bg-primary/40"
          />
        ))}
      </div>
    </div>
  )
}
