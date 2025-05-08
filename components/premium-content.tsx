"use client"

import React from "react"
import { useSubscription } from "../contexts/subscription-context"

interface PremiumContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  featureId?: string
}

const PremiumContent: React.FC<PremiumContentProps> = ({
  children,
  fallback = null,
  featureId = "premium-content",
}) => {
  const { canUseFeature, trackFeatureUsage } = useSubscription()

  // Track feature usage when component mounts
  React.useEffect(() => {
    if (canUseFeature(featureId)) {
      trackFeatureUsage(featureId)
    }
  }, [featureId, canUseFeature, trackFeatureUsage])

  // Since our subscription context now always returns true for canUseFeature,
  // this will always render the children
  if (canUseFeature(featureId)) {
    return <>{children}</>
  }

  // Fallback content for non-premium users (won't be reached with current context)
  return <>{fallback}</>
}

export default PremiumContent
