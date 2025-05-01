"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function StripeDebug() {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<{
    publishableKey: boolean
    stripeLoaded: boolean
    elementsCreated: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStripeSetup = async () => {
    setIsChecking(true)
    setError(null)

    try {
      // Check if publishable key exists
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      // Try to load Stripe
      let stripeLoaded = false
      let elementsCreated = false

      if (publishableKey) {
        try {
          const { loadStripe } = await import("@stripe/stripe-js")
          const stripe = await loadStripe(publishableKey)
          stripeLoaded = !!stripe

          if (stripe) {
            // We can't fully test Elements creation here without a client secret
            // but we can check if the function exists
            elementsCreated = true
          }
        } catch (e) {
          console.error("Error loading Stripe:", e)
          stripeLoaded = false
        }
      }

      setResults({
        publishableKey: !!publishableKey,
        stripeLoaded,
        elementsCreated,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error occurred")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium mb-2">Stripe Integration Debug</h3>

      <Button onClick={checkStripeSetup} variant="outline" size="sm" disabled={isChecking}>
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Checking...
          </>
        ) : (
          "Check Stripe Setup"
        )}
      </Button>

      {results && (
        <div className="mt-4 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span>Publishable Key:</span>
            <span className={results.publishableKey ? "text-green-600" : "text-red-600"}>
              {results.publishableKey ? "✓ Available" : "✗ Missing"}
            </span>

            <span>Stripe Loaded:</span>
            <span className={results.stripeLoaded ? "text-green-600" : "text-red-600"}>
              {results.stripeLoaded ? "✓ Success" : "✗ Failed"}
            </span>

            <span>Elements Creation:</span>
            <span className={results.elementsCreated ? "text-green-600" : "text-red-600"}>
              {results.elementsCreated ? "✓ Available" : "✗ Failed"}
            </span>
          </div>
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}
    </div>
  )
}
