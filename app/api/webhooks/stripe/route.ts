import { type NextRequest, NextResponse } from "next/server"
import { logError } from "@/utils/error-utils"
import { processStripeWebhookEvent, generateIdempotencyKey, type WebhookEventMetadata } from "@/lib/webhook-service"
import { hasProcessedEvent, recordProcessedEvent } from "@/lib/webhook-db"
import { verifyStripeSignature, verifyTimestamp, checkRateLimit } from "@/lib/webhook-security"
import { recordWebhookMetrics } from "@/lib/webhook-monitoring"

// Webhook configuration
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const RATE_LIMIT = 100 // Max requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit
    if (!checkRateLimit(ip, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 })
    }

    // Get request body and signature
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    // Validate signature header
    if (!signature) {
      console.error("Missing Stripe signature")
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
    }

    // Validate webhook secret
    if (!WEBHOOK_SECRET) {
      console.error("Stripe webhook secret is missing")
      return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 })
    }

    // Verify the webhook signature
    const { isValid, event, error } = verifyStripeSignature(body, signature, WEBHOOK_SECRET)

    if (!isValid || !event) {
      console.error(`Webhook signature verification failed: ${error?.message}`)
      return NextResponse.json({ error: error?.message || "Invalid signature" }, { status: 400 })
    }

    // Verify timestamp is recent
    if (!verifyTimestamp(event.created * 1000)) {
      console.error(`Webhook event is too old: ${event.id}`)
      return NextResponse.json({ error: "Event is too old" }, { status: 400 })
    }

    // Check for duplicate events (idempotency)
    const eventId = event.id
    const hasProcessed = await hasProcessedEvent(eventId)

    if (hasProcessed) {
      console.log(`Webhook event already processed: ${eventId}`)
      return NextResponse.json({ received: true, idempotent: true }, { status: 200 })
    }

    // Generate idempotency key and metadata
    const idempotencyKey = generateIdempotencyKey(event)
    const metadata: WebhookEventMetadata = {
      eventId: event.id,
      eventType: event.type,
      timestamp: event.created,
      apiVersion: event.api_version || "",
      idempotencyKey,
    }

    // Process the webhook event
    const result = await processStripeWebhookEvent(event, metadata)
    const processingTime = Date.now() - startTime

    // Record the processed event for idempotency
    await recordProcessedEvent(eventId, event.type, event.created, result, processingTime, result.error)

    // Record metrics
    recordWebhookMetrics({
      eventType: event.type,
      success: result.success,
      processingTime,
      error: result.error,
    })

    // Log processing time
    console.log(`Processed webhook event ${eventId} in ${processingTime}ms`)

    // Return appropriate response
    if (result.success) {
      return NextResponse.json({ received: true, processed: true })
    } else {
      // We still return 200 to acknowledge receipt, but include error details
      return NextResponse.json(
        {
          received: true,
          processed: false,
          error: result.message,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    // Calculate processing time even for errors
    const processingTime = Date.now() - startTime

    // Log the error
    logError("Unhandled error in webhook handler", error)

    // Record error metrics
    recordWebhookMetrics({
      eventType: "error",
      success: false,
      processingTime,
      error,
    })

    // Return error response
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Add a health check endpoint
export async function GET(request: NextRequest) {
  // Only allow health checks from authorized sources
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const validToken = process.env.WEBHOOK_HEALTH_CHECK_TOKEN

  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 })
  }

  // Return health status
  const { getWebhookHealthStatus } = await import("@/lib/webhook-monitoring")
  const healthStatus = getWebhookHealthStatus()

  return NextResponse.json(healthStatus)
}
