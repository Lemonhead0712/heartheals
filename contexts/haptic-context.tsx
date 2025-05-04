"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useHaptic as useHapticHook, type HapticIntensity, type HapticPattern } from "@/hooks/use-haptic"

/**
 * Type definition for the haptic context
 * Includes both the new API and legacy support
 */
type HapticContextType = ReturnType<typeof useHapticHook>

// Create a default context with empty implementations
const defaultHapticContext: HapticContextType = {
  // New API
  haptic: () => {},
  patternHaptic: () => {},
  isHapticSupported: () => false,
  settings: { enabled: false, intensity: "medium" },
  updateSettings: () => {},

  // Legacy API
  hapticEnabled: false,
  toggleHaptic: () => {},
  triggerHaptic: () => {},
}

// Create the context
const HapticContext = createContext<HapticContextType>(defaultHapticContext)

/**
 * Provider component for haptic feedback
 * Uses the unified haptic hook internally
 */
export const HapticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the unified hook
  const hapticUtils = useHapticHook()

  return <HapticContext.Provider value={hapticUtils}>{children}</HapticContext.Provider>
}

/**
 * Primary hook for accessing haptic functionality
 * This is the recommended way to access haptic features
 */
export const useHapticContext = () => {
  const context = useContext(HapticContext)
  if (!context) {
    throw new Error("useHapticContext must be used within a HapticProvider")
  }
  return context
}

/**
 * Alternative name for the same hook (for backward compatibility)
 * @deprecated Use useHapticContext instead
 */
export const useHaptic = useHapticContext

// Re-export types from the hook for convenience
export type { HapticIntensity, HapticPattern }
