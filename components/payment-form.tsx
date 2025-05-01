"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PaymentErrorGuidance } from "@/components/payment-error-guidance"
import { logPaymentError, parseStripeError } from "@/utils/payment-error-utils"

// Initialize Stripe with publishable key from environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

type PaymentFormWrapperProps = {
  amount: number
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error", message?: string) => void
}

export function PaymentForm({ amount, onPaymentStatusChange }: PaymentFormWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentError, setPaymentIntentError] = useState<string | null>(null)

  // Fetch the client secret when the component mounts
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch("/api/subscription/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent")
        }

        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error("Error creating payment intent:", error)
        logPaymentError(error, "create_payment_intent")
        setPaymentIntentError(error instanceof Error ? error.message : "Failed to initialize payment")
        onPaymentStatusChange("error", "Failed to initialize payment. Please try again.")
      }
    }

    fetchPaymentIntent()
  }, [amount, onPaymentStatusChange])

  // If we have an error creating the payment intent
  if (paymentIntentError) {
    return <PaymentErrorGuidance errorMessage={paymentIntentError} onRetry={() => window.location.reload()} />
  }

  // If we don't have a client secret yet, show a loading state
  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-purple-700">Initializing payment...</span>
      </div>
    )
  }

  // Once we have the client secret, render the Stripe Elements form
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#9c27b0",
            colorBackground: "#ffffff",
            colorText: "#6b21a8",
          },
        },
      }}
    >
      <CheckoutForm onPaymentStatusChange={onPaymentStatusChange} />
    </Elements>
  )
}

type CheckoutFormProps = {
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error", message?: string) => void
}

function CheckoutForm({ onPaymentStatusChange }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    setError(null)
    onPaymentStatusChange("processing")

    try {
      // Create the subscription
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
        redirect: "if_required",
      })

      if (result.error) {
        // Log the error for monitoring
        logPaymentError(result.error, "confirm_payment")

        // Handle the error
        setError(result.error)
        onPaymentStatusChange("error", result.error.message)
      } else {
        // Payment succeeded
        onPaymentStatusChange("success")
      }
    } catch (err) {
      // Handle unexpected errors
      logPaymentError(err, "payment_exception")
      setError(err)
      onPaymentStatusChange("error", "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    setRetryCount((prev) => prev + 1)
    onPaymentStatusChange("idle")
  }

  return (
    <div className="space-y-6">
      {error ? (
        <PaymentErrorGuidance
          errorCode={parseStripeError(error).code}
          errorMessage={error.message}
          onRetry={handleRetry}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">Your card will be securely processed by Stripe.</div>
        </form>
      )}
    </div>
  )
}
