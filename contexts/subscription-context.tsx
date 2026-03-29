"use client"

import type React from "react"
import { createContext, useContext } from "react"

/**
 * Subscription context is now a no-op -- all features are free.
 * The context is kept so existing consumers don't break,
 * but every feature check always returns "allowed".
 */

export type SubscriptionTier = "free" | "premium"

export type SubscriptionContextType = {
  tier: SubscriptionTier
  isActive: boolean
  expiresAt: Date | null
  featureUsage: Record<string, number>
  remainingDays: number | null
  canUseFeature: (featureId: string) => boolean
  useFeature: (featureId: string) => boolean
  resetFeatureUsage: (featureId: string) => void
  setTier: (tier: SubscriptionTier) => void
  setIsActive: (active: boolean) => void
  setExpiresAt: (date: Date | null) => void
  resetAllFeatureUsage: () => void
  isTestMode: boolean
  setIsTestMode: (isTest: boolean) => void
}

const noop = () => {}

const defaultValue: SubscriptionContextType = {
  tier: "premium",
  isActive: true,
  expiresAt: null,
  featureUsage: {},
  remainingDays: null,
  canUseFeature: () => true,
  useFeature: () => true,
  resetFeatureUsage: noop,
  setTier: noop,
  setIsActive: noop,
  setExpiresAt: noop,
  resetAllFeatureUsage: noop,
  isTestMode: false,
  setIsTestMode: noop,
}

const SubscriptionContext = createContext<SubscriptionContextType>(defaultValue)

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SubscriptionContext.Provider value={defaultValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = (): SubscriptionContextType => {
  return useContext(SubscriptionContext)
}
