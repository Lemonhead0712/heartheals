"use client"

import { createContext, useContext, type ReactNode, useEffect } from "react"
import { useHaptic, type HapticIntensity, type HapticPattern } from "@/hooks/use-haptic"

interface HapticContextType {
  haptic: (intensity?: HapticIntensity) => void
  patternHaptic: (pattern: HapticPattern | number[]) => void
  isHapticSupported: () => boolean
  settings: {
    enabled: boolean
    intensity: HapticIntensity
  }
  updateSettings: (settings: { enabled?: boolean; intensity?: HapticIntensity }) => void
}

const HapticContext = createContext<HapticContextType | undefined>(undefined)

export function HapticProvider({ children }: { children: ReactNode }) {
  const hapticUtils = useHaptic()

  // Add debugging to help identify any issues
  useEffect(() => {
    console.log("HapticProvider mounted")
    return () => console.log("HapticProvider unmounted")
  }, [])

  return <HapticContext.Provider value={hapticUtils}>{children}</HapticContext.Provider>
}

export function useHapticContext() {
  const context = useContext(HapticContext)
  if (context === undefined) {
    throw new Error("useHapticContext must be used within a HapticProvider")
  }
  return context
}
