"use client"

import React, { createContext, useContext, useState } from "react"

type HapticContextType = {
  hapticEnabled: boolean
  toggleHaptic: () => void
  triggerHaptic: (intensity?: "light" | "medium" | "heavy") => void
}

const defaultHapticContext: HapticContextType = {
  hapticEnabled: true,
  toggleHaptic: () => {},
  triggerHaptic: () => {},
}

const HapticContext = createContext<HapticContextType>(defaultHapticContext)

export const HapticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hapticEnabled, setHapticEnabled] = useState(true)

  // Load haptic preference from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPreference = localStorage.getItem("heartsHeal_hapticEnabled")
      if (savedPreference !== null) {
        setHapticEnabled(savedPreference === "true")
      }
    }
  }, [])

  const toggleHaptic = () => {
    const newValue = !hapticEnabled
    setHapticEnabled(newValue)
    if (typeof window !== "undefined") {
      localStorage.setItem("heartsHeal_hapticEnabled", String(newValue))
    }
  }

  const triggerHaptic = (intensity: "light" | "medium" | "heavy" = "medium") => {
    if (!hapticEnabled || typeof navigator === "undefined" || !navigator.vibrate) {
      return
    }

    // Different vibration patterns based on intensity
    switch (intensity) {
      case "light":
        navigator.vibrate(10)
        break
      case "medium":
        navigator.vibrate(35)
        break
      case "heavy":
        navigator.vibrate([50, 30, 50])
        break
      default:
        navigator.vibrate(35)
    }
  }

  return (
    <HapticContext.Provider
      value={{
        hapticEnabled,
        toggleHaptic,
        triggerHaptic,
      }}
    >
      {children}
    </HapticContext.Provider>
  )
}

export const useHaptic = () => {
  const context = useContext(HapticContext)
  if (!context) {
    throw new Error("useHaptic must be used within a HapticProvider")
  }
  return context
}

export const useHapticContext = useHaptic
