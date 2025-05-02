"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getTestCardDetails } from "@/lib/stripe"

export function TestModeBanner() {
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    // Check if we're in test mode by examining the Stripe publishable key
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    setIsTestMode(stripeKey.includes("test"))
  }, [])

  if (!isTestMode) return null

  const testCards = getTestCardDetails()

  return (
    <Alert variant="warning" className="border-yellow-300 bg-yellow-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 font-bold">Test Mode Active</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="mb-2">Payment system is in test mode. Use Stripe test cards only:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Success: {testCards.success.number}</li>
          <li>Decline: {testCards.decline.number}</li>
          <li>Insufficient Funds: {testCards.insufficient_funds.number}</li>
        </ul>
        <p className="mt-2">
          <a
            href="https://stripe.com/docs/testing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            View more test cards
          </a>
        </p>
      </AlertDescription>
    </Alert>
  )
}
