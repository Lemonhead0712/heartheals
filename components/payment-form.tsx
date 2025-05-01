"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Initialize Stripe with publishable key from environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

type PaymentFormWrapperProps = {
  amount: number
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error", message?: string) => void
}

export function PaymentForm({ amount, onPaymentStatusChange }: PaymentFormWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

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

        if (!response.ok) {
          throw new Error("Failed to create payment intent")
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error("Error creating payment intent:", error)
        onPaymentStatusChange("error", "Failed to initialize payment. Please try again.")
      }
    }

    fetchPaymentIntent()
  }, [amount, onPaymentStatusChange])

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
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    onPaymentStatusChange("processing")

    // Create the subscription
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
      },
      redirect: "if_required",
    })

    setIsProcessing(false)

    if (result.error) {
      // Show error to your customer
      setErrorMessage(result.error.message)
      onPaymentStatusChange("error", result.error.message)
    } else {
      // Payment succeeded
      onPaymentStatusChange("success")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

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
    </form>
  )
}
