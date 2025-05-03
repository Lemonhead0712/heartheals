import { logError } from "@/utils/error-utils"
import { createHash } from "crypto"
import type Stripe from "stripe"
import { processStripeWebhookEvent, type WebhookEventMetadata } from "./webhook-service"

// Interface for webhook destination
export interface WebhookDestination {
  id: string
  name: string
  url: string
  secret?: string
  active: boolean
  eventTypes: string[] // Array of event types to forward, empty means all
  headers?: Record<string, string>
  retryCount: number
  lastForwarded?: string
  createdAt: string
}

// Interface for webhook forwarding result
export interface ForwardingResult {
  success: boolean
  statusCode?: number
  message: string
  destination: WebhookDestination
  error?: any
}

// In-memory storage for destinations (in production, use a database)
let webhookDestinations: WebhookDestination[] = []

// Add a new webhook destination
export function addWebhookDestination(destination: Omit<WebhookDestination, "id" | "createdAt">): WebhookDestination {
  const newDestination: WebhookDestination = {
    ...destination,
    id: createHash("sha256").update(`${destination.url}-${Date.now()}`).digest("hex").substring(0, 10),
    createdAt: new Date().toISOString(),
  }

  webhookDestinations.push(newDestination)
  return newDestination
}

// Get all webhook destinations
export function getWebhookDestinations(): WebhookDestination[] {
  return webhookDestinations
}

// Get a webhook destination by ID
export function getWebhookDestinationById(id: string): WebhookDestination | undefined {
  return webhookDestinations.find((d) => d.id === id)
}

// Update a webhook destination
export function updateWebhookDestination(id: string, updates: Partial<WebhookDestination>): WebhookDestination | null {
  const index = webhookDestinations.findIndex((d) => d.id === id)
  if (index === -1) return null

  webhookDestinations[index] = {
    ...webhookDestinations[index],
    ...updates,
  }

  return webhookDestinations[index]
}

// Delete a webhook destination
export function deleteWebhookDestination(id: string): boolean {
  const initialLength = webhookDestinations.length
  webhookDestinations = webhookDestinations.filter((d) => d.id !== id)
  return webhookDestinations.length < initialLength
}

// Forward a webhook event to a destination
export async function forwardWebhookEvent(
  event: Stripe.Event,
  destination: WebhookDestination,
): Promise<ForwardingResult> {
  try {
    // Check if this destination should receive this event type
    if (destination.eventTypes.length > 0 && !destination.eventTypes.includes(event.type)) {
      return {
        success: true,
        statusCode: 200,
        message: `Event type ${event.type} not configured for destination ${destination.name}`,
        destination,
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "HeartHeals-Webhook-Forwarder/1.0",
      "X-Webhook-Source": "heartheals",
      "X-Webhook-Event-Type": event.type,
      "X-Webhook-Event-Id": event.id,
      ...(destination.headers || {}),
    }

    // Add signature if secret is provided
    if (destination.secret) {
      const timestamp = Math.floor(Date.now() / 1000)
      const payload = `${timestamp}.${JSON.stringify(event)}`
      const signature = createHash("sha256").update(`${destination.secret}${payload}`).digest("hex")

      headers["X-Webhook-Signature"] = signature
      headers["X-Webhook-Timestamp"] = timestamp.toString()
    }

    // Forward the event
    const response = await fetch(destination.url, {
      method: "POST",
      headers,
      body: JSON.stringify(event),
    })

    // Update last forwarded timestamp
    updateWebhookDestination(destination.id, {
      lastForwarded: new Date().toISOString(),
    })

    if (!response.ok) {
      throw new Error(`Destination responded with status: ${response.status}`)
    }

    return {
      success: true,
      statusCode: response.status,
      message: `Successfully forwarded event ${event.id} to ${destination.name}`,
      destination,
    }
  } catch (error) {
    logError(`Error forwarding webhook to ${destination.name} (${destination.url})`, error)

    return {
      success: false,
      message: `Failed to forward event ${event.id} to ${destination.name}`,
      destination,
      error,
    }
  }
}

// Forward a webhook event to all active destinations
export async function forwardWebhookEventToAll(
  event: Stripe.Event,
  metadata: WebhookEventMetadata,
): Promise<ForwardingResult[]> {
  // First process the event with our main webhook handler
  await processStripeWebhookEvent(event, metadata)

  // Then forward to all active destinations
  const activeDestinations = webhookDestinations.filter((d) => d.active)

  // If no destinations, return empty array
  if (activeDestinations.length === 0) {
    return []
  }

  // Forward to all destinations in parallel
  const forwardingPromises = activeDestinations.map((destination) => forwardWebhookEvent(event, destination))

  return Promise.all(forwardingPromises)
}

// Initialize with some example destinations (remove in production)
if (process.env.NODE_ENV === "development") {
  // Only add these in development mode
  if (webhookDestinations.length === 0) {
    addWebhookDestination({
      name: "Example Analytics Service",
      url: "https://example.com/webhook/analytics",
      active: false, // Disabled by default
      eventTypes: ["payment_intent.succeeded", "payment_intent.payment_failed"],
      retryCount: 3,
      headers: {
        "X-API-Key": "example-key",
      },
    })
  }
}
