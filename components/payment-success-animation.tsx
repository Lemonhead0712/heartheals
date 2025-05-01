"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Check, Heart } from "lucide-react"
import { logError } from "@/utils/error-utils"

interface PaymentSuccessAnimationProps {
  size?: "small" | "medium" | "large"
  showHearts?: boolean
  showSparkles?: boolean
  duration?: number
}

export function PaymentSuccessAnimation({
  size = "medium",
  showHearts = true,
  showSparkles = true,
  duration = 3000,
}: PaymentSuccessAnimationProps) {
  // Size mappings
  const sizeMap = {
    small: { container: "h-16 w-16", icon: "h-8 w-8" },
    medium: { container: "h-24 w-24", icon: "h-12 w-12" },
    large: { container: "h-32 w-32", icon: "h-16 w-16" },
  }

  // Trigger confetti effect
  useEffect(() => {
    try {
      const end = Date.now() + duration

      const frame = () => {
        try {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#9C27B0", "#E91E63", "#673AB7"],
          })

          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#9C27B0", "#E91E63", "#673AB7"],
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        } catch (error) {
          logError("confetti animation frame", error)
        }
      }

      frame()
    } catch (error) {
      logError("confetti animation", error)
    }
  }, [duration])

  return (
    <div className="relative">
      {/* Floating hearts animation */}
      {showHearts && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.random() * 100 - 50 + "%",
                y: "100%",
                opacity: 0.7,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: "-100%",
                opacity: 0,
                transition: {
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: Math.random() * 2,
                },
              }}
            >
              <Heart className="h-6 w-6 text-pink-400 fill-pink-400" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Success checkmark with sparkles */}
      <motion.div
        className={`${sizeMap[size].container} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto`}
        initial={{ rotate: -180, scale: 0.5 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", damping: 10, delay: 0.2 }}
      >
        <Check className={`${sizeMap[size].icon} text-white`} />

        {/* Sparkles */}
        {showSparkles &&
          [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 bg-white rounded-full"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * (size === "large" ? 70 : size === "medium" ? 50 : 30),
                y: Math.sin((i * Math.PI) / 4) * (size === "large" ? 70 : size === "medium" ? 50 : 30),
                opacity: [0, 1, 0],
                transition: {
                  duration: 1.5,
                  delay: 0.4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                },
              }}
            />
          ))}
      </motion.div>
    </div>
  )
}
