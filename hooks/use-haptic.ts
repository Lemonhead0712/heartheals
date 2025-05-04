"use client"

import { useState, useCallback, useEffect } from "react"

export type HapticIntensity = "light" | "medium" | "strong" | "heavy"
export type HapticPattern = "success" | "warning" | "error" | "notification" | "single" | "double"

// Default patterns (in milliseconds)
const DEFAULT_PATTERNS: Record<HapticPattern, number[]> = {
  success: [10, 100, 10],
  warning: [30, 100, 30, 100, 30],
  error: [100, 100, 100, 100, 100],
  notification: [10, 100, 10, 100, 10],
  single: [40],
  double: [40, 100, 40],
}

export interface HapticSettings {
  enabled: boolean
  intensity: HapticIntensity
}

/**
 * Hook for managing haptic feedback
 * @returns Haptic utilities and settings
 */
export function useHaptic() {
  const [settings, setSettings] = useState<HapticSettings>({
    enabled: true,
    intensity: "medium",
  })

  // Check if haptic feedback is supported
  const isHapticSupported = useCallback(() => {
    return typeof navigator !== "undefined" && "vibrate" in navigator
  }, [])

  // Trigger haptic feedback with specified intensity
  const haptic = useCallback(
    (intensity?: HapticIntensity) => {
      if (!settings.enabled || !isHapticSupported()) return

      const actualIntensity = intensity || settings.intensity
      let duration = 10 // light

      if (actualIntensity === "medium") duration = 20
      if (actualIntensity === "strong" || actualIntensity === "heavy") duration = 35

      try {
        navigator.vibrate(duration)
      } catch (error) {
        console.error("Haptic feedback error:", error)
      }
    },
    [settings.enabled, settings.intensity, isHapticSupported],
  )

  // Trigger pattern-based haptic feedback
  const patternHaptic = useCallback(
    (pattern: HapticPattern | number[]) => {
      if (!settings.enabled || !isHapticSupported()) return

      try {
        const vibrationPattern = Array.isArray(pattern) ? pattern : DEFAULT_PATTERNS[pattern]
        navigator.vibrate(vibrationPattern)
      } catch (error) {
        console.error("Pattern haptic feedback error:", error)
      }
    },
    [settings.enabled, isHapticSupported],
  )

  // Update haptic settings
  const updateSettings = useCallback((newSettings: Partial<HapticSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  // Initialize haptic settings from localStorage if available
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedSettings = localStorage.getItem("hapticSettings")
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error("Error loading haptic settings:", error)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("hapticSettings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving haptic settings:", error)
    }
  }, [settings])

  // Legacy support for old API
  const hapticEnabled = settings.enabled
  const toggleHaptic = useCallback(() => {
    updateSettings({ enabled: !settings.enabled })
  }, [settings.enabled, updateSettings])

  const triggerHaptic = useCallback(
    (intensity: HapticIntensity = "medium") => {
      haptic(intensity)
    },
    [haptic],
  )

  return {
    // New API
    haptic,
    patternHaptic,
    isHapticSupported,
    settings,
    updateSettings,

    // Legacy API support
    hapticEnabled,
    toggleHaptic,
    triggerHaptic,
  }
}
