"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HeartIcon } from "lucide-react"

type EmotionalThoughtsSpinnerProps = {
  size?: "sm" | "md" | "lg"
  className?: string
  message?: string
}

export function EmotionalThoughtsSpinner({
  size = "md",
  className,
  message = "Loading your journal entries...",
}: EmotionalThoughtsSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const containerSizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-6", containerSizeClasses[size], className)}>
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-purple-200 rounded-full blur-md"
          style={{
            width: size === "sm" ? "16px" : size === "md" ? "32px" : "48px",
            height: size === "sm" ? "16px" : size === "md" ? "32px" : "48px",
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <HeartIcon className={cn("text-purple-700", sizeClasses[size])} />
        </motion.div>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-purple-600 text-sm text-center"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
