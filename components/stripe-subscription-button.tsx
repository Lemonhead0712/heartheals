"use client"

import { useState } from "react"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type StripeSubscriptionButtonProps = {
  buyButtonId: string
  publishableKey: string
  className?: string
}

export function StripeSubscriptionButton({
  buyButtonId,
  publishableKey,
  className = "",
}: StripeSubscriptionButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Stripe script
    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/buy-button.js"
    script.async = true
    script.onload = () => {
      setIsLoading(false)
    }
    script.onerror = () => {
      setError("Failed to load Stripe payment button. Please try again later.")
      setIsLoading(false)
    }
    document.body.appendChild(script)

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className={`stripe-button-container ${className}`} ref={containerRef}>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-purple-700">Loading payment options...</span>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Payment Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Please try refreshing the page or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      ) : (
        <stripe-buy-button buy-button-id={buyButtonId} publishable-key={publishableKey}></stripe-buy-button>
      )}
    </div>
  )
}
