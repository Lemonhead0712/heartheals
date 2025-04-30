import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with secret keys
const getStripeInstance = (isTestMode: boolean) => {
  // In a real app, you would use environment variables for these keys
  const testKey = "sk_test_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  const liveKey = "sk_live_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  return new Stripe(isTestMode ? testKey : liveKey, {
    apiVersion: "2023-10-16",
  })
}

// Webhook secrets
const testWebhookSecret = "whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
const liveWebhookSecret = "whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    // Determine if the webhook is from test mode or live mode
    // In a real app, you might inspect the event or use separate webhook endpoints
    const isTestMode = true
    const stripe = getStripeInstance(isTestMode)
    const webhookSecret = isTestMode ? testWebhookSecret : liveWebhookSecret

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Handle specific event types
  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook event:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Webhook event handlers
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // In a real app, you would update your database to record the new subscription
  console.log(`Subscription created: ${subscription.id}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // In a real app, you would update your database with the subscription changes
  console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // In a real app, you would update your database to mark the subscription as cancelled
  console.log(`Subscription deleted: ${subscription.id}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // In a real app, you would update your database to record the successful payment
  console.log(`Invoice payment succeeded: ${invoice.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // In a real app, you would update your database and possibly notify the user
  console.log(`Invoice payment failed: ${invoice.id}`)
}
