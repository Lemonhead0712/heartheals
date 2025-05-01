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
    const { customerId, priceId } = await request.json()

    // Validate required fields
    if (!customerId || !priceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get Stripe instance
    let stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      console.error("Error initializing Stripe:", error)
      return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
    }

    // Create the subscription
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      })

      // @ts-ignore - Stripe types are not fully compatible with TypeScript
      const clientSecret = subscription.latest_invoice.payment_intent.client_secret

      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret,
      })
    } catch (error) {
      // Handle Stripe API errors
      if (error instanceof Stripe.errors.StripeError) {
        console.error("Stripe API error:", error.message)
        return NextResponse.json({ error: `Payment service error: ${error.message}` }, { status: 400 })
      }

      // Handle other errors
      console.error("Error creating subscription:", error)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
