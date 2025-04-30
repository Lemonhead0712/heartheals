"use client"

import { type ReactNode, useEffect } from "react"
import { useSubscription } from "@/contexts/subscription-context"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Sparkles } from "lucide-react"
import Link from "next/link"

type FeatureGateProps = {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ featureId, children, fallback }: FeatureGateProps) {
  const { canUseFeature, useFeature, tier } = useSubscription()

  const hasAccess = canUseFeature(featureId)

  // Call useFeature unconditionally
  useEffect(() => {
    if (hasAccess) {
      useFeature(featureId)
    }
  }, [hasAccess, featureId, useFeature])

  // If user has access, render the children
  if (hasAccess) {
    return <>{children}</>
  }

  // If a fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>
  }

  // Default fallback is a locked feature card
  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <Lock className="h-8 w-8 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold text-purple-700 mb-2">Premium Feature</h3>
        <p className="text-purple-600 mb-4">
          {tier === "premium"
            ? "Your premium subscription is inactive. Please renew to access this feature."
            : "This feature requires a premium subscription."}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/subscription">
            <Sparkles className="h-4 w-4 mr-2" />
            {tier === "premium" ? "Renew Subscription" : "Upgrade to Premium"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
