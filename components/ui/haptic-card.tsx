"use client"

import type React from "react"
import { Card, type CardProps } from "@/components/ui/card"
import { useHapticContext } from "@/contexts/haptic-context"
import type { HapticIntensity } from "@/hooks/use-haptic"

interface HapticCardProps extends CardProps {
  hapticIntensity?: HapticIntensity
  interactive?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export function HapticCard({
  hapticIntensity = "light",
  interactive = false,
  onClick,
  className,
  ...props
}: HapticCardProps) {
  const { haptic } = useHapticContext()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      haptic(hapticIntensity)

      if (onClick) {
        onClick(e)
      }
    }
  }

  return (
    <Card onClick={handleClick} className={`${className || ""} ${interactive ? "cursor-pointer" : ""}`} {...props} />
  )
}

// Re-export the other components from the original Card
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
