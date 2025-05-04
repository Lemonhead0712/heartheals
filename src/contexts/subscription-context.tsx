"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type SubscriptionTier = "free" | "premium"

export type FeatureUsage = {
  [key: string]: number // Track usage count for each feature
}

export type SubscriptionContextType = {
  tier: SubscriptionTier
  isActive: boolean
  expiresAt: Date | null
  featureUsage: FeatureUsage
  remainingDays: number | null
  // Feature access methods
  canUseFeature: (featureId: string) => boolean
  useFeature: (featureId: string) => boolean
  resetFeatureUsage: (featureId: string) => void
  // For testing/development
  setTier: (tier: SubscriptionTier) => void
  setIsActive: (active: boolean) => void
  setExpiresAt: (date: Date | null) => void
  resetAllFeatureUsage: () => void
  updateSubscriptionStatus: (newTier: "free" | "premium", newIsActive: boolean) => void
  immediatelyActivatePremium: () => void
}

// Create a default context value to avoid null checks
const defaultContextValue: SubscriptionContextType = {
  tier: "free",
  isActive: false,
  expiresAt: null,
  featureUsage: {},
  remainingDays: null,
  canUseFeature: () => false,
  useFeature: () => false,
  resetFeatureUsage: () => {},
  setTier: () => {},
  setIsActive: () => {},
  setExpiresAt: () => {},
  resetAllFeatureUsage: () => {},
  updateSubscriptionStatus: () => {},
  immediatelyActivatePremium: () => {},
}

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContextValue)

// Feature usage limits for free tier
const FREE_TIER_LIMITS: { [key: string]: number } = {
  "emotional-log": 3,
  "breathing-exercise": 3,
  "journal-entry": 3,
  quiz: 1,
  analytics: 0, // Not available in free tier
  meditation: 1,
  export: 0, // Not available in free tier
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isActive, setIsActive] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage>({})

  // Load subscription data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTier = localStorage.getItem("heartsHeal_subscriptionTier")
        const savedIsActive = localStorage.getItem("heartsHeal_subscriptionActive")
        const savedExpiresAt = localStorage.getItem("heartsHeal_subscriptionExpires")
        const savedFeatureUsage = localStorage.getItem("heartsHeal_featureUsage")

        if (savedTier) setTier(savedTier as SubscriptionTier)
        if (savedIsActive) setIsActive(savedIsActive === "true")
        if (savedExpiresAt) setExpiresAt(new Date(savedExpiresAt))
        if (savedFeatureUsage) setFeatureUsage(JSON.parse(savedFeatureUsage))
      } catch (error) {
        console.error("Error loading subscription data:", error)
        // Continue with default values if there's an error
      }
    }
  }, [])

  // Save subscription data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("heartsHeal_subscriptionTier", tier)
        localStorage.setItem("heartsHeal_subscriptionActive", String(isActive))
        if (expiresAt) localStorage.setItem("heartsHeal_subscriptionExpires", expiresAt.toISOString())
        localStorage.setItem("heartsHeal_featureUsage", JSON.stringify(featureUsage))
      } catch (error) {
        console.error("Error saving subscription data:", error)
        // Continue even if localStorage fails
      }
    }
  }, [tier, isActive, expiresAt, featureUsage])

  // Calculate remaining days in subscription
  const remainingDays = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  // Check if a feature can be used based on subscription tier and usage
  const canUseFeature = (featureId: string): boolean => {
    // Premium tier has unlimited access to all features
    if (tier === "premium" && isActive) {
      return true
    }

    // Free tier has limited access
    const limit = FREE_TIER_LIMITS[featureId] || 0
    const usage = featureUsage[featureId] || 0
    return usage < limit
  }

  // Record usage of a feature
  const useFeature = (featureId: string): boolean => {
    // If premium and active, allow usage without counting
    if (tier === "premium" && isActive) {
      return true
    }

    // For free tier, check limits
    const limit = FREE_TIER_LIMITS[featureId] || 0
    const currentUsage = featureUsage[featureId] || 0

    if (currentUsage < limit) {
      setFeatureUsage((prev) => ({
        ...prev,
        [featureId]: (prev[featureId] || 0) + 1,
      }))
      return true
    }

    return false
  }

  // Reset usage for a specific feature
  const resetFeatureUsage = (featureId: string) => {
    setFeatureUsage((prev) => ({
      ...prev,
      [featureId]: 0,
    }))
  }

  // Reset all feature usage
  const resetAllFeatureUsage = () => {
    setFeatureUsage({})
  }

  // Update tier with persistence
  const updateTier = (newTier: SubscriptionTier) => {
    setTier(newTier)
  }

  // Add a function to update subscription status
  const updateSubscriptionStatus = (newTier: "free" | "premium", newIsActive: boolean) => {
    setTier(newTier)
    setIsActive(newIsActive)

    // Save to localStorage
    try {
      localStorage.setItem(
        "heartsHeal_subscription",
        JSON.stringify({
          tier: newTier,
          isActive: newIsActive,
          updatedAt: new Date().toISOString(),
        }),
      )
    } catch (error) {
      console.error("Error saving subscription status:", error)
    }
  }

  const immediatelyActivatePremium = () => {
    // Set premium tier and active status
    setTier("premium")
    setIsActive(true)

    // Set expiry date to 1 month from now
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1)
    setExpiresAt(expiryDate)

    // Save to localStorage
    try {
      localStorage.setItem(
        "heartsHeal_subscription",
        JSON.stringify({
          tier: "premium",
          isActive: true,
          startDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
        }),
      )
    } catch (error) {
      console.error("Error saving subscription status:", error)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isActive,
        expiresAt,
        featureUsage,
        remainingDays,
        canUseFeature,
        useFeature,
        resetFeatureUsage,
        setTier: updateTier,
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
    // Return default context instead of throwing to prevent app crashes
    return defaultContextValue
  }
  return context
}
