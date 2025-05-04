"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

// Define a simplified context type that maintains the same interface
// but provides universal access to all features
export type SubscriptionContextType = {
  // We'll keep these properties for backward compatibility
  tier: "premium"
  isActive: true
  expiresAt: null
  featureUsage: {}
  remainingDays: null
  // Feature access methods - now always return true
  canUseFeature: (featureId: string) => boolean
  useFeature: (featureId: string) => boolean
  trackFeatureUsage: (featureId: string) => void // New method that doesn't return anything
  resetFeatureUsage: (featureId: string) => void
  // For compatibility with existing code
  setTier: (tier: string) => void
  setIsActive: (active: boolean) => void
  setExpiresAt: (date: Date | null) => void
  resetAllFeatureUsage: () => void
  updateSubscriptionStatus: (newTier: string, newIsActive: boolean) => void
  immediatelyActivatePremium: () => void
}

// Create a default context value that grants access to all features
const defaultContextValue: SubscriptionContextType = {
  tier: "premium",
  isActive: true,
  expiresAt: null,
  featureUsage: {},
  remainingDays: null,
  canUseFeature: () => true,
  useFeature: () => true,
  trackFeatureUsage: () => {}, // New method
  resetFeatureUsage: () => {},
  setTier: () => {},
  setIsActive: () => {},
  setExpiresAt: () => {},
  resetAllFeatureUsage: () => {},
  updateSubscriptionStatus: () => {},
  immediatelyActivatePremium: () => {},
}

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContextValue)

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Track feature usage for analytics purposes only
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({})

  // Load feature usage data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedFeatureUsage = localStorage.getItem("heartsHeal_featureUsage")
        if (savedFeatureUsage) {
          setFeatureUsage(JSON.parse(savedFeatureUsage))
        }
      } catch (error) {
        console.error("Error loading feature usage data:", error)
      }
    }
  }, [])

  // Save feature usage data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("heartsHeal_featureUsage", JSON.stringify(featureUsage))
      } catch (error) {
        console.error("Error saving feature usage data:", error)
      }
    }
  }, [featureUsage])

  // Feature access is always granted
  const canUseFeature = useCallback(() => true, [])

  // DEPRECATED: This method updates state during render and should not be used
  // Keep it for backward compatibility but log a warning
  const useFeature = useCallback((featureId: string) => {
    console.warn(
      "useFeature is deprecated and may cause React state updates during render. Use trackFeatureUsage instead.",
    )
    // Return true without updating state to avoid the error
    return true
  }, [])

  // New method: Track feature usage without returning a value
  // This should be called in useEffect, not during render
  const trackFeatureUsage = useCallback((featureId: string) => {
    setFeatureUsage((prev) => ({
      ...prev,
      [featureId]: (prev[featureId] || 0) + 1,
    }))
  }, [])

  // Reset usage for a specific feature (for analytics)
  const resetFeatureUsage = useCallback((featureId: string) => {
    setFeatureUsage((prev) => ({
      ...prev,
      [featureId]: 0,
    }))
  }, [])

  // Reset all feature usage (for analytics)
  const resetAllFeatureUsage = useCallback(() => {
    setFeatureUsage({})
  }, [])

  // No-op functions for backward compatibility
  const setTier = useCallback(() => {}, [])
  const setIsActive = useCallback(() => {}, [])
  const setExpiresAt = useCallback(() => {}, [])
  const updateSubscriptionStatus = useCallback(() => {}, [])
  const immediatelyActivatePremium = useCallback(() => {}, [])

  return (
    <SubscriptionContext.Provider
      value={{
        tier: "premium",
        isActive: true,
        expiresAt: null,
        featureUsage,
        remainingDays: null,
        canUseFeature,
        useFeature,
        trackFeatureUsage,
        resetFeatureUsage,
        setTier,
        setIsActive,
        setExpiresAt,
        resetAllFeatureUsage,
        updateSubscriptionStatus,
        immediatelyActivatePremium,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    console.error("useSubscription must be used within a SubscriptionProvider")
    return defaultContextValue
  }
  return context
}
