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
      // Add metadata for better tracking
      metadata: {
        product: "HeartHeals Premium Subscription",
        amount_display: `$${(amount / 100).toFixed(2)}`,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    // Log the error for monitoring
    console.error("Error creating payment intent:", error)

    // Handle Stripe API errors
    if (error instanceof Stripe.errors.StripeError) {
      const errorMessage = getStripeErrorMessage(error)
      return NextResponse.json(
        {
          error: errorMessage,
          code: error.code,
          type: error.type,
        },
        { status: 400 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to create payment intent. Please try again later.",
      },
      { status: 500 },
    )
  }
}

// Helper function to get user-friendly error messages
function getStripeErrorMessage(error: Stripe.errors.StripeError): string {
  switch (error.type) {
    case "StripeCardError":
      return `Card error: ${error.message}`
    case "StripeInvalidRequestError":
      return "Invalid payment information. Please check and try again."
    case "StripeAPIError":
      return "Payment system error. Please try again later."
    case "StripeConnectionError":
      return "Connection to payment system failed. Please try again later."
    case "StripeAuthenticationError":
      return "Authentication with payment system failed. Please contact support."
    case "StripeRateLimitError":
      return "Too many requests. Please try again later."
    default:
      return "An error occurred processing your payment. Please try again."
  }
}
