import crypto from "crypto"
import type Stripe from "stripe"

// Generate a mock Stripe event for testing
export function generateMockStripeEvent(
  type: string,
  data: any,
  options: { id?: string; created?: number } = {},
): Stripe.Event {
  const id = options.id || `evt_${crypto.randomBytes(16).toString("hex")}`
  const created = options.created || Math.floor(Date.now() / 1000)

  return {
    id,
    object: "event",
    api_version: "2023-10-16",
    created,
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: `req_${crypto.randomBytes(16).toString("hex")}`,
      idempotency_key: crypto.randomBytes(16).toString("hex"),
    },
    type,
  } as Stripe.Event
}

// Generate a mock Stripe webhook signature
export function generateMockStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const payloadToSign = `${timestamp}.${payload}`
  const signature = crypto.createHmac("sha256", secret).update(payloadToSign).digest("hex")
  return `t=${timestamp},v1=${signature}`
}

// Generate test webhook events for various scenarios
export function generateTestWebhookEvents(): {
  [key: string]: { event: Stripe.Event; signature: string }
} {
  const webhookSecret = "whsec_test_secret"

  // Subscription created event
  const subscriptionCreated = generateMockStripeEvent("customer.subscription.created", {
    id: "sub_123456",
    object: "subscription",
    status: "active",
    customer: "cus_123456",
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    items: {
      data: [
        {
          price: {
            id: "price_123456",
            unit_amount: 500,
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
        },
      ],
    },
  })

  // Payment succeeded event
  const paymentSucceeded = generateMockStripeEvent("payment_intent.succeeded", {
    id: "pi_123456",
    object: "payment_intent",
    amount: 500,
    currency: "usd",
    status: "succeeded",
    customer: "cus_123456",
  })

  // Payment failed event
  const paymentFailed = generateMockStripeEvent("payment_intent.payment_failed", {
    id: "pi_123456",
    object: "payment_intent",
    amount: 500,
    currency: "usd",
    status: "requires_payment_method",
    customer: "cus_123456",
    last_payment_error: {
      message: "Your card was declined.",
      code: "card_declined",
    },
  })

  // Generate signatures
  const events = {
    subscriptionCreated,
    paymentSucceeded,
    paymentFailed,
  }

  return Object.entries(events).reduce(
    (acc, [key, event]) => {
      const payload = JSON.stringify(event)
      const signature = generateMockStripeSignature(payload, webhookSecret)
      acc[key] = { event, signature }
      return acc
    },
    {} as { [key: string]: { event: Stripe.Event; signature: string } },
  )
}
