"use client"

import { useSubscription } from "@/contexts/subscription-context"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SubscriptionStatus() {
  const { tier, isActive, remainingDays } = useSubscription()

  if (tier === "free") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="border-border text-muted-foreground">
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
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {remainingDays !== null
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
            <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5">
              <AlertCircle className="h-3 w-3 mr-1" />
              Premium Inactive
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
