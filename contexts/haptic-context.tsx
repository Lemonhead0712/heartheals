"use client"

import { createContext, useContext, type ReactNode } from "react"
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

  return <HapticContext.Provider value={hapticUtils}>{children}</HapticContext.Provider>
}

export function useHapticContext() {
  const context = useContext(HapticContext)
  if (context === undefined) {
    throw new Error("useHapticContext must be used within a HapticProvider")
  }
  return context
}
