"use client"

import { motion } from "framer-motion"

interface InspirationalQuoteProps {
  className?: string
}

export function InspirationalQuote({ className }: InspirationalQuoteProps) {
  return (
    <motion.div
      className="max-w-5xl mx-auto rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm p-8 border border-purple-100/50 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <div className="flex flex-col items-center text-center">
        <svg className="w-10 h-10 text-pink-300 mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-lg md:text-xl text-center italic text-purple-800 leading-relaxed mb-4">
          Healing doesn't happen all at once — it happens breath by breath, thought by thought, moment by moment.
          HeartsHeal is here for each one.
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mx-auto mt-2"></div>
      </div>
    </motion.div>
  )
}
