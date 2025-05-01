import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { customerId, priceId } = await request.json()

    // Validate required fields
    if (!customerId || !priceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the subscription
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
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
