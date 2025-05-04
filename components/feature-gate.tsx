"use client"

import { useEffect, type ReactNode } from "react"
import { useSubscription } from "@/contexts/subscription-context"

interface FeatureGateProps {
  children: ReactNode
  featureId: string
  title?: string
  description?: string
  showUpgradeButton?: boolean
}

export function FeatureGate({
  children,
  featureId,
  title = "Feature",
  description = "This feature is available to all users.",
  showUpgradeButton = false,
}: FeatureGateProps) {
  // Get subscription context
  const { trackFeatureUsage } = useSubscription()

  // Track feature usage after component mounts, not during render
  useEffect(() => {
    trackFeatureUsage(featureId)
  }, [featureId, trackFeatureUsage])

  // Always render the children - all features are accessible
  return <>{children}</>
}
