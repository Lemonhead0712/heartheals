"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const quotes = [
  "Healing doesn't happen all at once -- it happens breath by breath, thought by thought, moment by moment.",
  "You are allowed to take up space. You are allowed to feel. You are allowed to heal.",
  "The wound is the place where the light enters you.",
  "Every feeling you have is valid. Every step you take is progress.",
  "Be gentle with yourself. You are doing the best you can.",
]

interface InspirationalQuoteProps {
  className?: string
}

export function InspirationalQuote({ className }: InspirationalQuoteProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // Pick a random quote on mount
    setIndex(Math.floor(Math.random() * quotes.length))
  }, [])

  return (
    <div
      className={cn(
        "glass-card rounded-2xl px-6 py-8 sm:px-10 sm:py-10 max-w-2xl mx-auto text-center",
        className,
      )}
    >
      <svg
        className="w-8 h-8 text-primary/30 mx-auto mb-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-serif text-lg sm:text-xl text-foreground/80 leading-relaxed italic text-balance"
        >
          {quotes[index]}
        </motion.p>
      </AnimatePresence>

      <div className="w-12 h-0.5 bg-primary/20 rounded-full mx-auto mt-6" />
    </div>
  )
}
