"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const sizes = {
  small:  { img: 26, text: "text-[15px]" },
  medium: { img: 64, text: "text-lg" },
  large:  { img: 88, text: "text-2xl" },
} as const

export function Logo({
  className = "",
  size = "medium",
  animate = false,
  showText = true,
}: {
  className?: string
  size?: keyof typeof sizes
  animate?: boolean
  showText?: boolean
}) {
  const { img, text } = sizes[size]

  const imgEl = (
    <Image
      src="/images/heart-heals-logo.png"
      alt="HeartsHeal"
      width={img}
      height={img}
      className="drop-shadow-sm"
      priority
    />
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {animate ? (
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {imgEl}
        </motion.div>
      ) : (
        imgEl
      )}
      {showText && (
        <span className={cn("font-serif font-semibold tracking-tight text-foreground leading-none", text)}>
          HeartsHeal
        </span>
      )}
    </div>
  )
}
