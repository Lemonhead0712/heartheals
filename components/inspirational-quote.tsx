"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const quotes = [
  {
    text: "Healing doesn't happen all at once — it happens breath by breath, thought by thought, moment by moment.",
    author: "Unknown",
  },
  {
    text: "You are allowed to take up space. You are allowed to feel. You are allowed to heal.",
    author: "Unknown",
  },
  {
    text: "The wound is the place where the light enters you.",
    author: "Rumi",
  },
  {
    text: "Every feeling you have is valid. Every step you take is progress.",
    author: "Unknown",
  },
  {
    text: "Be gentle with yourself. You are doing the best you can.",
    author: "Unknown",
  },
  {
    text: "Grief is the price we pay for love, and love is always worth it.",
    author: "Unknown",
  },
  {
    text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or anxious.",
    author: "Lori Deschene",
  },
]

interface InspirationalQuoteProps {
  className?: string
}

export function InspirationalQuote({ className }: InspirationalQuoteProps) {
  const [index, setIndex]       = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused]     = useState(false)

  const next = useCallback(() => {
    setDirection(1)
    setIndex((i) => (i + 1) % quotes.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setIndex((i) => (i - 1 + quotes.length) % quotes.length)
  }, [])

  useEffect(() => {
    // Start at a random quote
    setIndex(Math.floor(Math.random() * quotes.length))
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 8000)
    return () => clearInterval(t)
  }, [next, paused])

  const { text, author } = quotes[index]

  return (
    <div
      className={cn(
        "glass-card rounded-3xl px-6 py-8 sm:px-10 sm:py-10 max-w-2xl mx-auto text-center relative group",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Open-quote mark */}
      <div
        className="absolute top-4 left-6 font-serif text-6xl leading-none text-primary/15 select-none pointer-events-none"
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d * 20, y: 4 }),
            center: { opacity: 1, x: 0, y: 0 },
            exit:  (d: number) => ({ opacity: 0, x: d * -20, y: -4 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-serif text-lg sm:text-xl text-foreground/85 leading-relaxed italic text-balance px-2">
            {text}
          </p>
          {author !== "Unknown" && (
            <p className="mt-3 text-xs font-medium text-muted-foreground tracking-wider uppercase">
              — {author}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i) }}
            aria-label={`Go to quote ${i + 1}`}
            className={cn(
              "rounded-full transition-all duration-300",
              i === index
                ? "w-4 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>

      {/* Prev / Next arrows (visible on hover) */}
      <button
        onClick={prev}
        aria-label="Previous quote"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        aria-label="Next quote"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
