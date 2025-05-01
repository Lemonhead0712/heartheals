"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Sparkles, Heart } from "lucide-react"
import confetti from "canvas-confetti"

interface PaymentSuccessAnimationProps {
  onComplete: () => void
  duration?: number
}

export function PaymentSuccessAnimation({ onComplete, duration = 3000 }: PaymentSuccessAnimationProps) {
  const [showHearts, setShowHearts] = useState(false)

  useEffect(() => {
    // Trigger confetti effect
    const end = Date.now() + duration
    const colors = ["#9c27b0", "#e91e63", "#673ab7"]

    // Launch confetti
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()

    // Show hearts after a short delay
    setTimeout(() => {
      setShowHearts(true)
    }, 500)

    // Call onComplete after animation duration
    const timer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  // Generate random positions for floating hearts
  const hearts = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: 0.5 + Math.random() * 0.5,
    rotation: Math.random() * 30 - 15,
    delay: Math.random() * 0.5,
  }))

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Floating hearts */}
        {showHearts &&
          hearts.map((heart) => (
            <motion.div
              key={heart.id}
              className="absolute text-pink-500"
              initial={{
                x: `${heart.x}vw`,
                y: `${heart.y + 20}vh`,
                opacity: 0,
                scale: 0,
                rotate: heart.rotation,
              }}
              animate={{
                y: `${heart.y - 20}vh`,
                opacity: [0, 1, 0],
                scale: [0, heart.scale, 0],
                rotate: heart.rotation,
              }}
              transition={{
                duration: 3,
                delay: heart.delay,
                ease: "easeOut",
              }}
            >
              <Heart className="w-8 h-8 fill-pink-400" />
            </motion.div>
          ))}

        {/* Main success animation */}
        <motion.div
          className="flex flex-col items-center justify-center p-8 rounded-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 100,
              delay: 0.2,
            }}
          >
            <div className="relative">
              <CheckCircle2 className="h-32 w-32 text-green-500" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Sparkles className="h-12 w-12 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2
            className="mt-8 text-3xl font-bold text-purple-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Payment Successful!
          </motion.h2>

          <motion.p
            className="mt-4 text-xl text-purple-600 text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Thank you for subscribing to HeartHeals Premium
          </motion.p>

          <motion.p
            className="mt-2 text-purple-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Redirecting you to your dashboard...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )
}
