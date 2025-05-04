"use client"

import type { ReactNode } from "react"
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
  // Get the useFeature function but don't call it in a way that creates an update loop
  const { useFeature } = useSubscription()

  // Call useFeature once when the component mounts
  // This is safe because we're not updating state based on the result
  // and we're not using the return value to conditionally render
  useFeature(featureId)

  // Always render the children - all features are accessible
  return <>{children}</>
}
