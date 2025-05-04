"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useHaptic as useHapticHook, type HapticIntensity } from "@/hooks/use-haptic"

// Define the context type based on what the hook returns
type HapticContextType = ReturnType<typeof useHapticHook>

// Create a default context with empty functions
const defaultHapticContext: HapticContextType = {
  haptic: () => {},
  patternHaptic: () => {},
  isHapticSupported: () => false,
  settings: {
    enabled: false,
    intensity: "medium" as HapticIntensity,
  },
  updateSettings: () => {},
}

// Create the context
const HapticContext = createContext<HapticContextType>(defaultHapticContext)

// Provider component
export function HapticProvider({ children }: { children: React.ReactNode }) {
  // Use the actual hook
  const hapticUtils = useHapticHook()

  return <HapticContext.Provider value={hapticUtils}>{children}</HapticContext.Provider>
}

// Hook to use the context
export const useHapticContext = () => {
  const context = useContext(HapticContext)
  if (!context) {
    throw new Error("useHapticContext must be used within a HapticProvider")
  }
  return context
}

// Alias for backward compatibility
export const useHaptic = useHapticContext
