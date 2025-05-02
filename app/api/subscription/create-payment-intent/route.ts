import { NextResponse } from "next/server"
import Stripe from "stripe"
import { checkRateLimit } from "@/lib/rate-limit"

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
    // Get client IP address
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit (5 attempts per minute)
    const rateLimitResult = checkRateLimit({
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      identifier: ip,
    })

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many payment attempts. Please try again in ${resetInSeconds} seconds.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(resetInSeconds),
          },
        },
      )
    }

    const { amount, email, name, testMode } = await request.json()

    // Log payment attempt for debugging
    console.log(`Payment attempt: ${amount} cents for ${email} (${name})${testMode ? " - TEST MODE" : ""}`)

    // Validate the required fields
    if (!amount || amount < 50) {
      console.error(`Invalid amount: ${amount}`)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!email || !email.includes("@")) {
      console.error(`Invalid email: ${email}`)
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!name) {
      console.error("Name is missing")
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
      // Check if we're in test mode
      const secretKey = process.env.STRIPE_SECRET_KEY || ""
      const isTestMode = secretKey.includes("test")

      if (isTestMode) {
        console.log("Creating payment intent in TEST MODE")
      }

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
          test_mode: isTestMode ? "true" : "false",
        },
        receipt_email: email,
        description: "HeartHeals Premium Subscription",
      })

      console.log(`Payment intent created successfully: ${paymentIntent.id}`)

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isTestMode,
      })
    } catch (error) {
      // Handle Stripe API errors
      if (error instanceof Stripe.errors.StripeError) {
        console.error("Stripe API error:", error.message, error.type, error.code)

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

        return NextResponse.json(
          {
            error: `Payment service error: ${error.message}`,
            code: error.code,
            type: error.type,
          },
          { status: 400 },
        )
      }

      // Handle other errors
      console.error("Error creating payment intent:", error)
      return NextResponse.json(
        {
          error: "Failed to create payment intent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json(
      {
        error: "Invalid request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}
