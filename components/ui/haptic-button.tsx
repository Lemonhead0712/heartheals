"use client"

import type React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useHapticContext } from "@/contexts/haptic-context"
import type { HapticIntensity, HapticPattern } from "@/hooks/use-haptic"

interface HapticButtonProps extends ButtonProps {
  hapticIntensity?: HapticIntensity
  hapticPattern?: HapticPattern
}

export function HapticButton({ hapticIntensity, hapticPattern, onClick, ...props }: HapticButtonProps) {
  const { haptic, patternHaptic } = useHapticContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticPattern) {
      patternHaptic(hapticPattern)
    } else {
      haptic(hapticIntensity)
    }

    if (onClick) {
      onClick(e)
    }
  }

  return <Button onClick={handleClick} {...props} />
}
