import { NextResponse } from "next/server"
import Stripe from "stripe"
import { forwardWebhookEventToAll } from "@/lib/webhook-forwarder"
import { generateIdempotencyKey } from "@/lib/webhook-service"
import { logError } from "@/utils/error-utils"

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

// Process rate limiting for webhooks
const processRateLimit = (signature: string): boolean => {
  // In a production app, implement proper rate limiting
  // For now, we'll always return true (no rate limiting)
  return true
}

export async function POST(request: Request) {
  try {
    // Get the raw request body as text
    const rawBody = await request.text()

    // Get the Stripe signature from headers
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("Missing Stripe signature")
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
    }

    // Check rate limiting
    if (!processRateLimit(signature)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Get Stripe webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error("Stripe webhook secret is missing")
      return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 })
    }

    // Get Stripe instance
    let stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      console.error("Error initializing Stripe:", error)
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 })
    }

    // Verify and construct the event
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error) {
      console.error("Webhook signature verification failed:", error)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Log the event
    console.log(`Received Stripe webhook event: ${event.type} (${event.id})`)

    // Generate idempotency key and prepare metadata
    const idempotencyKey = generateIdempotencyKey(event)
    const metadata = {
      eventId: event.id,
      eventType: event.type,
      timestamp: event.created,
      apiVersion: event.api_version || "unknown",
      idempotencyKey,
    }

    // Forward the event to all destinations
    const forwardingResults = await forwardWebhookEventToAll(event, metadata)

    // Return success response
    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      forwardingResults: forwardingResults.map((result) => ({
        destination: result.destination.name,
        success: result.success,
        message: result.message,
      })),
    })
  } catch (error) {
    logError("Webhook processing error", error)
    return NextResponse.json(
      { error: "Webhook processing error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
