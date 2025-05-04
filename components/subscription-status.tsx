"use client"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"

/**
 * SubscriptionStatus component - Replacement for the previous subscription status component
 * Now displays a simple badge indicating all features are available
 */
export function SubscriptionStatus() {
  return (
    <Badge variant="outline" className="bg-white/80 text-pink-600 border-pink-200 flex items-center gap-1 px-2 py-1">
      <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
      <span className="text-xs">All Features Available</span>
    </Badge>
  )
}
