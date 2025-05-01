"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/contexts/subscription-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

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
  title = "Premium Feature",
  description = "This feature requires a premium subscription.",
  showUpgradeButton = true,
}: FeatureGateProps) {
  const { canUseFeature, useFeature, tier, isActive } = useSubscription()
  const router = useRouter()

  // Check if the user can access this feature
  const canAccess = canUseFeature(featureId)

  // Record usage for free tier users.  Call the hook unconditionally, but only execute its logic if the conditions are met.
  useEffect(() => {
    if ((tier === "free" && tier === "premium" && isActive) || canAccess) {
      useFeature(featureId)
    }
  }, [canAccess, featureId, tier, isActive, useFeature])

  // If the user has premium and it's active, or they can use the feature, show the content
  if ((tier === "premium" && isActive) || canAccess) {
    return <>{children}</>
  }

  // Otherwise, show the upgrade prompt
  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-purple-800 flex items-center justify-center">
          <Lock className="h-5 w-5 mr-2 text-purple-600" />
          {title}
        </CardTitle>
        <CardDescription className="text-purple-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-600 mb-4">
          {tier === "free" ? (
            <>You've reached the usage limit for this feature in the free tier.</>
          ) : (
            <>Upgrade to HeartHeals Premium to unlock unlimited access to this feature.</>
          )}
        </p>
      </CardContent>
      {showUpgradeButton && (
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/subscription")} className="bg-purple-600 hover:bg-purple-700 text-white">
            Upgrade to Premium
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
