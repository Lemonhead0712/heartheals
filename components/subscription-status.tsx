"use client"

import { useSubscription } from "@/contexts/subscription-context"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SubscriptionStatus() {
  const { tier, isActive, remainingDays, isTestMode } = useSubscription()

  if (tier === "free") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              Free Tier
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Limited access to features. Upgrade for full access.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (tier === "premium" && isActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
              {isTestMode && " (Test)"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isTestMode
                ? "Test mode: Simulating premium access"
                : remainingDays !== null
                  ? `Premium access active. Renews in ${remainingDays} days.`
                  : "Premium access active."}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (tier === "premium" && !isActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
              <AlertCircle className="h-3 w-3 mr-1" />
              Premium Inactive
              {isTestMode && " (Test)"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your premium subscription is currently inactive.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return null
}
