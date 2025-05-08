"use client"

import { useSubscription } from "@/context/subscription-context"
import { redirect } from "next/navigation"
import PremiumContent from "@/components/premium-content"

const SubscriptionPage = () => {
  const { tier, isLoading } = useSubscription()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!tier) {
    redirect("/")
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subscription Page</h1>
      {/* Since tier is always "premium" now, just render premium content */}
      <PremiumContent />
    </div>
  )
}

export default SubscriptionPage
