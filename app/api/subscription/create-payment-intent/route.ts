import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the secret key from environment variables
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Stripe secret key is missing")
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  })
}

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    // Validate the amount
    if (!amount || amount < 50) {
      // Minimum amount is $0.50
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get Stripe instance
    let stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      console.error("Error initializing Stripe:", error)
      return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
    }

    // Create a PaymentIntent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
      // Handle Stripe API errors
      if (error instanceof Stripe.errors.StripeError) {
        console.error("Stripe API error:", error.message)

        // Check for specific error types
        if (error.type === "StripeAuthenticationError") {
          return NextResponse.json(
            { error: "Payment service authentication failed. Please check API keys." },
            { status: 401 },
          )
        }

        return NextResponse.json({ error: `Payment service error: ${error.message}` }, { status: 400 })
      }

      // Handle other errors
      console.error("Error creating payment intent:", error)
      return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
