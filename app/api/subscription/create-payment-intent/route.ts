import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    // Validate the amount
    if (!amount || amount < 50) {
      // Minimum amount is $0.50
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
