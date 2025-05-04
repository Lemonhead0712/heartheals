import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripeInstance } from "@/lib/stripe"
import { rateLimit } from "@/lib/rate-limit"
import { logPaymentEvent, logPaymentError } from "@/lib/payment-logger"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { checkForFraud } from "@/lib/fraud-detection"

// Rate limiter: 5 attempts per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per interval
})

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting and fraud detection
    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown"

    // Get user agent for fraud detection
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Apply rate limiting
    try {
      await limiter.check(5, clientIp) // 5 requests per minute per IP
    } catch (error) {
      logPaymentEvent(
        "rate_limit_exceeded",
        {
          ip: clientIp,
          userAgent,
          timestamp: new Date().toISOString(),
        },
        "warning",
      )

      return NextResponse.json({ error: "Too many payment attempts. Please try again later." }, { status: 429 })
    }

    // Parse request body
    const { amount, email, name, testMode = false } = await request.json()

    // Validate required fields
    if (!amount || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for authenticated user
    const user = await getAuthenticatedUser(request)

    // Check for fraud
    const fraudCheck = await checkForFraud({
      ip: clientIp,
      email,
      amount,
      userAgent,
      customerId: user?.customerId,
    })

    // If suspicious, reject or flag the payment
    if (fraudCheck.isSuspicious) {
      logPaymentEvent(
        "fraud_detected",
        {
          ip: clientIp,
          email,
          amount,
          riskScore: fraudCheck.riskScore,
          reasons: fraudCheck.reasons,
          timestamp: new Date().toISOString(),
        },
        "warning",
      )

      // If risk score is very high, reject the payment
      if (fraudCheck.riskScore >= 75) {
        return NextResponse.json(
          { error: "This payment attempt has been flagged for security reasons. Please contact support." },
          { status: 403 },
        )
      }

      // If moderate risk, we'll continue but flag the payment intent
    }

    // Get Stripe instance
    let stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      logPaymentError("stripe_initialization", error)
      return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
    }

    // Create the payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          email,
          name,
          testMode: testMode ? "true" : "false",
          fraudScore: fraudCheck.riskScore.toString(),
          fraudReasons: fraudCheck.reasons.join(", ").substring(0, 500), // Stripe metadata has size limits
          createdAt: new Date().toISOString(),
          ip: clientIp.substring(0, 100), // Don't store full IP in metadata
        },
        receipt_email: email,
      })

      // Log successful payment intent creation
      logPaymentEvent("payment_intent_created", {
        paymentIntentId: paymentIntent.id,
        amount,
        email,
        testMode,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        isTestMode: testMode,
      })
    } catch (error) {
      // Handle Stripe API errors
      if (error instanceof Stripe.errors.StripeError) {
        logPaymentError("stripe_api_error", error, {
          code: error.code,
          type: error.type,
          amount,
          email,
        })

        return NextResponse.json({ error: `Payment service error: ${error.message}` }, { status: 400 })
      }

      // Handle other errors
      logPaymentError("payment_intent_creation", error, { amount, email })
      return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
    }
  } catch (error) {
    logPaymentError("request_processing", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
