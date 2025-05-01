import { NextResponse } from "next/server"
import Stripe from "stripe"
import { sendSubscriptionConfirmationEmail } from "@/lib/email-utils"

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
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  // Get webhook secret from environment variables
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("Stripe webhook secret is missing")
    return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    // Get Stripe instance
    const stripe = getStripeInstance()

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
  console.log(`Subscription created: ${subscription.id}`)

  try {
    // Get customer details to send confirmation email
    const stripe = getStripeInstance()
    const customerId = subscription.customer as string

    const customer = await stripe.customers.retrieve(customerId)

    if (customer && !customer.deleted) {
      const email = customer.email
      const name = customer.name

      if (email) {
        // Get subscription plan details
        const priceId = subscription.items.data[0]?.price.id
        const price = priceId ? await stripe.prices.retrieve(priceId) : null
        const productId = price?.product as string
        const product = productId ? await stripe.products.retrieve(productId) : null

        const planName = product?.name || "Premium"
        const amount = price ? `$${(price.unit_amount! / 100).toFixed(2)}` : "$5.00"

        // Send confirmation email
        await sendSubscriptionConfirmationEmail({
          email,
          userName: name || "Valued User",
          subscriptionPlan: planName,
          amount: `${amount} / month`,
        })
      }
    }
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error)
  }
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

  // If this is a subscription invoice, we might want to send a receipt
  if (invoice.subscription) {
    try {
      const stripe = getStripeInstance()
      const customerId = invoice.customer as string

      const customer = await stripe.customers.retrieve(customerId)

      if (customer && !customer.deleted && customer.email) {
        // Here you could send a payment receipt email
        // This is different from the subscription confirmation
        console.log(`Could send payment receipt to ${customer.email}`)
      }
    } catch (error) {
      console.error("Error processing invoice payment success:", error)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // In a real app, you would update your database and possibly notify the user
  console.log(`Invoice payment failed: ${invoice.id}`)
}
