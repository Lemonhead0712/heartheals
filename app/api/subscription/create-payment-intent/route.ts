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
    const { amount, email, name } = await request.json()

    // Validate the required fields
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
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
        metadata: {
          email,
          name,
          product: "HeartHeals Premium Subscription",
        },
        receipt_email: email,
        description: "HeartHeals Premium Subscription",
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      })
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

        if (error.type === "StripeCardError") {
          return NextResponse.json({ error: `Card error: ${error.message}` }, { status: 400 })
        }

        if (error.type === "StripeRateLimitError") {
          return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
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
