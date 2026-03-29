"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Logo({
  className = "",
  size = "medium",
  animate = false,
  showText = true,
}: {
  className?: string
  size?: "small" | "medium" | "large"
  animate?: boolean
  showText?: boolean
}) {
  const sizes = {
    small: { width: 28, height: 28 },
    medium: { width: 72, height: 72 },
    large: { width: 100, height: 100 },
  }

  const logoComponent = animate ? (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: [0.95, 1.02, 0.95] }}
      transition={{
        duration: 4,
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
        className="drop-shadow-sm"
        priority
      />
    </motion.div>
  ) : (
    <Image
      src="/images/heart-heals-logo.png"
      alt="HeartsHeal Logo"
      width={sizes[size].width}
      height={sizes[size].height}
      className="drop-shadow-sm"
      priority
    />
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logoComponent}
      {showText && (
        <span
          className={cn(
            "font-serif font-semibold tracking-tight text-foreground",
            size === "small" && "text-base",
            size === "medium" && "text-xl",
            size === "large" && "text-2xl",
          )}
        >
          HeartsHeal
        </span>
      )}
    </div>
  )
}
