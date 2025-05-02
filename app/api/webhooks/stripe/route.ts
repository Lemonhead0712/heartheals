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
        const interval = price?.recurring?.interval || "month"
        const intervalCount = price?.recurring?.interval_count || 1

        // Format the billing period
        const billingPeriod = intervalCount === 1 ? interval : `${intervalCount} ${interval}s`

        // Send confirmation email
        await sendSubscriptionConfirmationEmail({
          email,
          userName: name || "Valued User",
          subscriptionPlan: planName,
          amount: `${amount} / ${billingPeriod}`,
          subscriptionId: subscription.id,
          startDate: new Date(subscription.current_period_start * 1000).toLocaleDateString(),
          endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
        })

        // In a real app, you would update your database with the subscription details
        // For example:
        // await db.subscriptions.create({
        //   userId: getUserIdFromEmail(email),
        //   stripeCustomerId: customerId,
        //   stripeSubscriptionId: subscription.id,
        //   planId: productId,
        //   status: subscription.status,
        //   currentPeriodStart: new Date(subscription.current_period_start * 1000),
        //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        //   createdAt: new Date(),
        // })
      }
    }
  } catch (error) {
    console.error("Error processing subscription creation:", error)
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
  console.log(`Invoice payment succeeded: ${invoice.id}`)

  // If this is a subscription invoice, we might want to send a receipt
  if (invoice.subscription) {
    try {
      const stripe = getStripeInstance()
      const customerId = invoice.customer as string
      const subscriptionId = invoice.subscription as string

      const customer = await stripe.customers.retrieve(customerId)
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      if (customer && !customer.deleted && customer.email) {
        // Get payment details
        const paymentIntentId = invoice.payment_intent as string
        let paymentMethod = null

        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          if (paymentIntent.payment_method) {
            paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string)
          }
        }

        // Format card details if available
        let paymentDetails = "Payment method not available"
        if (paymentMethod && paymentMethod.type === "card" && paymentMethod.card) {
          const card = paymentMethod.card
          paymentDetails = `${card.brand.toUpperCase()} ending in ${card.last4}`
        }

        // Here you would send a payment receipt email
        // For example:
        // await sendPaymentReceiptEmail({
        //   email: customer.email,
        //   userName: customer.name || "Valued User",
        //   invoiceId: invoice.id,
        //   amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
        //   paymentDate: new Date(invoice.created * 1000).toLocaleDateString(),
        //   paymentMethod: paymentDetails,
        //   subscriptionPlan: subscription.items.data[0]?.price.nickname || "Premium",
        // })

        // In a real app, you would update your database with the payment details
        // For example:
        // await db.payments.create({
        //   userId: getUserIdFromEmail(customer.email),
        //   stripeInvoiceId: invoice.id,
        //   stripePaymentIntentId: paymentIntentId,
        //   amount: invoice.amount_paid,
        //   status: 'succeeded',
        //   createdAt: new Date(invoice.created * 1000),
        // })
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
