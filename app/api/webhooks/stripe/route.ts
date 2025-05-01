import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Webhook secret from environment variable
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
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
