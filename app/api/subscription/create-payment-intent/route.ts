import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with secret keys
const getStripeInstance = (isTestMode: boolean) => {
  // In a real app, you would use environment variables for these keys
  const testKey = "sk_test_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  const liveKey = "sk_live_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  return new Stripe(isTestMode ? testKey : liveKey, {
    apiVersion: "2023-10-16",
  })
}

export async function POST(request: Request) {
  try {
    const { amount, isTestMode } = await request.json()

    // Validate the amount
    if (!amount || amount < 50) {
      // Minimum amount is $0.50
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const stripe = getStripeInstance(isTestMode)

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        isTest: isTestMode ? "true" : "false",
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
