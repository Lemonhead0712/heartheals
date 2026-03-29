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
  "You deserve gentleness, especially from yourself.",
]

export function LoadingScreen() {
  const [affirmation, setAffirmation] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setAffirmation((prev) => (prev + 1) % affirmations.length)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-page-gradient z-50">
      {/* Soft ambient circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/6 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/4 blur-2xl animate-pulse-slow [animation-delay:1.4s]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mb-8"
      >
        <Logo size="large" animate />
      </motion.div>

      {/* Rotating affirmation */}
      <div className="relative z-10 h-14 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={affirmation}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center text-base font-serif italic text-muted-foreground max-w-xs px-6"
          >
            {affirmations[affirmation]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <motion.div
        className="relative z-10 flex gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.85, 0.35] }}
            transition={{
              duration: 1.4,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.22,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-primary/60"
          />
        ))}
      </motion.div>
    </div>
  )
}
