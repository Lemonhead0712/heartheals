"use client"

import { createContext, useContext, type ReactNode, useEffect } from "react"
import { useHaptic, type HapticIntensity, type HapticPattern } from "@/hooks/use-haptic"

interface HapticContextType {
  haptic: (intensity?: HapticIntensity) => void
  patternHaptic: (pattern: HapticPattern | number[]) => void
  isHapticSupported: () => boolean
  triggerHaptic: (intensity?: HapticIntensity) => void // Add this line to provide the function that's being called
  settings: {
    enabled: boolean
    intensity: HapticIntensity
  }
  updateSettings: (settings: { enabled?: boolean; intensity?: HapticIntensity }) => void
}

const HapticContext = createContext<HapticContextType | undefined>(undefined)

export function HapticProvider({ children }: { children: ReactNode }) {
  const hapticUtils = useHaptic()

  // Create an enhanced version of hapticUtils that includes triggerHaptic
  const enhancedHapticUtils = {
    ...hapticUtils,
    triggerHaptic: hapticUtils.haptic, // Add triggerHaptic as an alias for haptic
  }

  // Add debugging to help identify any issues
  useEffect(() => {
    console.log("HapticProvider mounted")
    return () => console.log("HapticProvider unmounted")
  }, [])

  return <HapticContext.Provider value={enhancedHapticUtils}>{children}</HapticContext.Provider>
}

export function useHapticContext() {
  const context = useContext(HapticContext)
  if (context === undefined) {
    // Instead of throwing an error, provide a fallback implementation
    // This prevents the app from crashing if the context isn't available
    console.warn("useHapticContext was used outside of HapticProvider, using fallback implementation")
    return {
      haptic: () => {},
      patternHaptic: () => {},
      triggerHaptic: () => {},
      isHapticSupported: () => false,
      settings: {
        enabled: false,
        intensity: "medium" as HapticIntensity,
      },
      updateSettings: () => {},
    }
  }
  return context
}
