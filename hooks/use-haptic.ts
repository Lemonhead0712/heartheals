"use client"

import { useState, useEffect } from "react"

export type HapticIntensity = "none" | "light" | "medium" | "strong"
export type HapticPattern = "single" | "double" | "success" | "error" | "warning" | "custom"

interface HapticSettings {
  enabled: boolean
  intensity: HapticIntensity
}

/**
 * Custom hook for providing haptic feedback on supported devices
 */
export function useHaptic() {
  const [settings, setSettings] = useState<HapticSettings>({
    enabled: true,
    intensity: "medium",
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("hapticSettings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error("Error loading haptic settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hapticSettings", JSON.stringify(settings))
      } catch (error) {
        console.error("Error saving haptic settings:", error)
      }
    }
  }, [settings])

  /**
   * Get the vibration duration based on intensity setting
   */
  const getDuration = (intensity: HapticIntensity = settings.intensity): number => {
    switch (intensity) {
      case "none":
        return 0
      case "light":
        return 10
      case "medium":
        return 20
      case "strong":
        return 35
      default:
        return 20
    }
  }

  /**
   * Trigger a vibration with the specified duration
   */
  const triggerHaptic = (duration: number) => {
    if (!settings.enabled || duration === 0) return

    // Check if the browser supports the Vibration API
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(duration)
    }
  }

  /**
   * Trigger haptic feedback with the specified intensity
   */
  const haptic = (intensity?: HapticIntensity) => {
    const duration = getDuration(intensity)
    triggerHaptic(duration)
  }

  /**
   * Trigger a pattern of haptic feedback
   */
  const patternHaptic = (pattern: HapticPattern | number[]) => {
    if (!settings.enabled) return

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern)
      } else {
        switch (pattern) {
          case "single":
            navigator.vibrate(getDuration())
            break
          case "double":
            navigator.vibrate([getDuration(), 50, getDuration()])
            break
          case "success":
            navigator.vibrate([getDuration("light"), 30, getDuration("medium")])
            break
          case "error":
            navigator.vibrate([getDuration("strong"), 20, getDuration("medium"), 20, getDuration("light")])
            break
          case "warning":
            navigator.vibrate([getDuration("medium"), 40, getDuration("medium")])
            break
        }
      }
    }
  }

  /**
   * Check if haptic feedback is supported on the current device
   */
  const isHapticSupported = () => {
    return typeof navigator !== "undefined" && "vibrate" in navigator
  }

  /**
   * Update haptic settings
   */
  const updateSettings = (newSettings: Partial<HapticSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return {
    haptic,
    patternHaptic,
    isHapticSupported,
    settings,
    updateSettings,
  }
}
