"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
  const canUseFeature = () => true

  // Track feature usage for analytics only
  const useFeature = (featureId: string) => {
    setFeatureUsage((prev) => ({
      ...prev,
      [featureId]: (prev[featureId] || 0) + 1,
    }))
    return true
  }

  // Reset usage for a specific feature (for analytics)
  const resetFeatureUsage = (featureId: string) => {
    setFeatureUsage((prev) => ({
      ...prev,
      [featureId]: 0,
    }))
  }

  // Reset all feature usage (for analytics)
  const resetAllFeatureUsage = () => {
    setFeatureUsage({})
  }

  // No-op functions for backward compatibility
  const setTier = () => {}
  const setIsActive = () => {}
  const setExpiresAt = () => {}
  const updateSubscriptionStatus = () => {}
  const immediatelyActivatePremium = () => {}

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
