"use client"

import { useState, useEffect, useContext } from "react"
import { HapticContext } from "@/contexts/haptic-context"

// Fallback haptic functions
const fallbackHaptic = {
  haptic: () => {},
  patternHaptic: () => {},
}

export function useSafeHaptic() {
  const [hapticContext, setHapticContext] = useState(fallbackHaptic)
  const [hapticAvailable, setHapticAvailable] = useState(false)

  const context = useContext(HapticContext)

  useEffect(() => {
    if (context) {
      setHapticContext(context)
      setHapticAvailable(true)
    } else {
      console.error("Haptic context not available")
      setHapticContext(fallbackHaptic)
      setHapticAvailable(false)
    }
  }, [context])

  return {
    ...hapticContext,
    hapticAvailable,
  }
}
