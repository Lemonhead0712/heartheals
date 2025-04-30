"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function Logo({
  className = "",
  size = "medium",
  animate = false,
  showText = true,
}: {
  className?: string
  size?: "xsmall" | "small" | "medium" | "large"
  animate?: boolean
  showText?: boolean
}) {
  const sizes = {
    xsmall: { width: 24, height: 24 },
    small: { width: 32, height: 32 },
    medium: { width: 80, height: 80 },
    large: { width: 120, height: 120 },
  }

  const textSizes = {
    xsmall: "text-xs",
    small: "text-sm",
    medium: "text-xl",
    large: "text-2xl",
  }

  const logoComponent = animate ? (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: [0.9, 1.05, 0.9] }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <Image
        src="/images/heart-heals-logo.png"
        alt="HeartsHeal Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        className="drop-shadow-md"
        priority
      />
    </motion.div>
  ) : (
    <Image
      src="/images/heart-heals-logo.png"
      alt="HeartsHeal Logo"
      width={sizes[size].width}
      height={sizes[size].height}
      className="drop-shadow-md"
      priority
    />
  )

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {logoComponent}
      {showText && <h2 className={`font-semibold text-purple-700 mt-1 ${textSizes[size]}`}>HeartHeals</h2>}
    </div>
  )
}
