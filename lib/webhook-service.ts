import { logError } from "@/utils/error-utils"
import { createHash } from "crypto"
import type Stripe from "stripe"
import { getStripeInstance } from "./stripe"
import { sendPaymentFailureEmail, sendPaymentReceiptEmail, sendSubscriptionConfirmationEmail } from "./email-utils"
import { recordPaymentAnalytics } from "./payment-analytics"

// Interface for webhook event processing result
export interface WebhookProcessingResult {
  success: boolean
  message: string
  data?: any
  error?: any
}

// Interface for webhook event metadata
export interface WebhookEventMetadata {
  eventId: string
  eventType: string
  timestamp: number
  apiVersion: string
  idempotencyKey?: string
}

// Generate a unique idempotency key for an event
export function generateIdempotencyKey(event: Stripe.Event): string {
  return createHash("sha256").update(`${event.id}-${event.type}-${event.created}`).digest("hex")
}

// Process a Stripe webhook event
export async function processStripeWebhookEvent(
  event: Stripe.Event,
  metadata: WebhookEventMetadata,
): Promise<WebhookProcessingResult> {
  try {
    console.log(`Processing Stripe webhook event: ${event.type} (${event.id})`)

    // Record event for analytics
    await recordPaymentAnalytics({
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date(event.created * 1000).toISOString(),
      data: {
        object: event.data.object,
        metadata: metadata,
      },
    })

    // Process different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        return await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)

      case "payment_intent.payment_failed":
        return await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)

      case "customer.subscription.created":
        return await handleSubscriptionCreated(event.data.object as Stripe.Subscription)

      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)

      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)

      case "invoice.payment_succeeded":
        return await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)

      case "invoice.payment_failed":
        return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)

      case "payment_method.attached":
        return await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)

      default:
        // Log unhandled event types but return success to acknowledge receipt
        console.log(`Unhandled event type: ${event.type}`)
        return {
          success: true,
          message: `Unhandled event type: ${event.type}`,
        }
    }
  } catch (error) {
    logError(`Webhook processing error for event ${event.id}`, error)
    return {
      success: false,
      message: "Error processing webhook event",
      error,
    }
  }
}

// Handler for payment intent succeeded events
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<WebhookProcessingResult> {
  try {
    console.log(`Payment intent succeeded: ${paymentIntent.id} for amount ${paymentIntent.amount}`)

    // In a real app, you would update your database with the payment details
    // await db.payments.update({...})

    return {
      success: true,
      message: `Payment intent succeeded: ${paymentIntent.id}`,
      data: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      },
    }
  } catch (error) {
    logError(`Error processing payment intent success: ${paymentIntent.id}`, error)
    return {
      success: false,
      message: `Error processing payment intent success: ${paymentIntent.id}`,
      error,
    }
  }
}

// Handler for payment intent failed events
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<WebhookProcessingResult> {
  try {
    console.log(`Payment intent failed: ${paymentIntent.id}`)

    // In a real app, you would update your database with the failed payment details
    // await db.payments.update({...})

    return {
      success: true,
      message: `Payment intent failed: ${paymentIntent.id}`,
      data: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        error: paymentIntent.last_payment_error,
      },
    }
  } catch (error) {
    logError(`Error processing payment intent failure: ${paymentIntent.id}`, error)
    return {
      success: false,
      message: `Error processing payment intent failure: ${paymentIntent.id}`,
      error,
    }
  }
}

// Handler for payment method attached events
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<WebhookProcessingResult> {
  try {
    console.log(`Payment method attached: ${paymentMethod.id}`)

    // In a real app, you would update your database with the payment method
    // await db.paymentMethods.create({...})

    return {
      success: true,
      message: `Payment method attached: ${paymentMethod.id}`,
      data: {
        paymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        customerId: paymentMethod.customer,
      },
    }
  } catch (error) {
    logError(`Error processing payment method attachment: ${paymentMethod.id}`, error)
    return {
      success: false,
      message: `Error processing payment method attachment: ${paymentMethod.id}`,
      error,
    }
  }
}

// Handler for subscription created events
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
  // Implementation remains the same as before
  try {
    console.log(`Subscription created: ${subscription.id}`)

    // Get customer details
    const stripe = getStripeInstance()
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)

    if (customer && !customer.deleted && customer.email) {
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
      const emailResult = await sendSubscriptionConfirmationEmail({
        email: customer.email,
        userName: customer.name || "Valued User",
        subscriptionPlan: planName,
        amount: `${amount} / ${billingPeriod}`,
        subscriptionId: subscription.id,
        startDate: new Date(subscription.current_period_start * 1000).toLocaleDateString(),
        endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
      })

      // In a real app, you would update your database with the subscription details
      // await db.subscriptions.create({...})

      return {
        success: true,
        message: `Subscription created: ${subscription.id}`,
        data: {
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status,
          emailSent: emailResult.success,
        },
      }
    }

    return {
      success: true,
      message: `Subscription created but customer details not available: ${subscription.id}`,
    }
  } catch (error) {
    logError(`Error processing subscription creation: ${subscription.id}`, error)
    return {
      success: false,
      message: `Error processing subscription creation: ${subscription.id}`,
      error,
    }
  }
}

// Handler for subscription updated events
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
  // Implementation remains the same as before
  try {
    console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`)

    // In a real app, you would update your database with the subscription changes
    // await db.subscriptions.update({...})

    return {
      success: true,
      message: `Subscription updated: ${subscription.id}`,
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
      },
    }
  } catch (error) {
    logError(`Error processing subscription update: ${subscription.id}`, error)
    return {
      success: false,
      message: `Error processing subscription update: ${subscription.id}`,
      error,
    }
  }
}

// Handler for subscription deleted events
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
  // Implementation remains the same as before
  try {
    console.log(`Subscription deleted: ${subscription.id}`)

    // In a real app, you would update your database to mark the subscription as cancelled
    // await db.subscriptions.update({...})

    return {
      success: true,
      message: `Subscription deleted: ${subscription.id}`,
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
      },
    }
  } catch (error) {
    logError(`Error processing subscription deletion: ${subscription.id}`, error)
    return {
      success: false,
      message: `Error processing subscription deletion: ${subscription.id}`,
      error,
    }
  }
}

// Handler for invoice payment succeeded events
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<WebhookProcessingResult> {
  // Implementation remains the same as before
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`)

    // If this is a subscription invoice, we might want to send a receipt
    if (invoice.subscription) {
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
          paymentDetails = `${card.brand.toUpperCase()} •••• ${card.last4}`
        }

        // Get subscription plan details
        const priceId = subscription.items.data[0]?.price.id
        const price = priceId ? await stripe.prices.retrieve(priceId) : null
        const productId = price?.product as string
        const product = productId ? await stripe.products.retrieve(productId) : null
        const planName = product?.name || "Premium"

        // Send payment receipt email
        const emailResult = await sendPaymentReceiptEmail({
          email: customer.email,
          userName: customer.name || "Valued User",
          invoiceId: invoice.id,
          amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
          paymentDate: new Date(invoice.created * 1000).toLocaleDateString(),
          paymentMethod: paymentDetails,
          subscriptionPlan: planName,
          nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
        })

        // In a real app, you would update your database with the payment details
        // await db.payments.create({...})

        return {
          success: true,
          message: `Invoice payment succeeded: ${invoice.id}`,
          data: {
            invoiceId: invoice.id,
            subscriptionId,
            customerId,
            amount: invoice.amount_paid,
            emailSent: emailResult.success,
          },
        }
      }
    }

    return {
      success: true,
      message: `Invoice payment succeeded: ${invoice.id}`,
    }
  } catch (error) {
    logError(`Error processing invoice payment success: ${invoice.id}`, error)
    return {
      success: false,
      message: `Error processing invoice payment success: ${invoice.id}`,
      error,
    }
  }
}

// Handler for invoice payment failed events
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<WebhookProcessingResult> {
  // Implementation remains the same as before
  try {
    console.log(`Invoice payment failed: ${invoice.id}`)

    const stripe = getStripeInstance()
    const customerId = invoice.customer as string

    const customer = await stripe.customers.retrieve(customerId)

    if (customer && !customer.deleted && customer.email) {
      // Get payment details
      const paymentIntentId = invoice.payment_intent as string
      let paymentMethod = null
      let failureReason = "Your payment could not be processed"

      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        if (paymentIntent.payment_method) {
          paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string)
        }

        // Get detailed failure reason
        if (paymentIntent.last_payment_error) {
          failureReason = paymentIntent.last_payment_error.message || failureReason
        }
      }

      // Format card details if available
      let paymentDetails = "Payment method not available"
      if (paymentMethod && paymentMethod.type === "card" && paymentMethod.card) {
        const card = paymentMethod.card
        paymentDetails = `${card.brand.toUpperCase()} •••• ${card.last4}`
      }

      // Get subscription details if this is a subscription invoice
      let subscriptionPlan = "Premium"
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const priceId = subscription.items.data[0]?.price.id
        if (priceId) {
          const price = await stripe.prices.retrieve(priceId)
          const productId = price.product as string
          const product = await stripe.products.retrieve(productId)
          subscriptionPlan = product.name || subscriptionPlan
        }
      }

      // Send payment failure email
      const emailResult = await sendPaymentFailureEmail({
        email: customer.email,
        userName: customer.name || "Valued User",
        invoiceId: invoice.id,
        amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
        failureDate: new Date(invoice.created * 1000).toLocaleDateString(),
        failureReason: failureReason,
        paymentMethod: paymentDetails,
        subscriptionPlan: subscriptionPlan,
      })

      // In a real app, you would update your database with the failed payment details
      // await db.payments.create({...})

      return {
        success: true,
        message: `Invoice payment failed: ${invoice.id}`,
        data: {
          invoiceId: invoice.id,
          customerId,
          amount: invoice.amount_due,
          failureReason,
          emailSent: emailResult.success,
        },
      }
    }

    return {
      success: true,
      message: `Invoice payment failed: ${invoice.id}`,
    }
  } catch (error) {
    logError(`Error processing invoice payment failure: ${invoice.id}`, error)
    return {
      success: false,
      message: `Error processing invoice payment failure: ${invoice.id}`,
      error,
    }
  }
}

// Handler for charge succeeded events
async function handleChargeSucceeded(charge: Stripe.Charge): Promise<WebhookProcessingResult> {
  try {
    console.log(`Charge succeeded: ${charge.id}`)

    // In a real app, you would update your database with the charge details
    // await db.charges.create({...})

    return {
      success: true,
      message: `Charge succeeded: ${charge.id}`,
      data: {
        chargeId: charge.id,
        amount: charge.amount,
        status: charge.status,
      },
    }
  } catch (error) {
    logError(`Error processing charge success: ${charge.id}`, error)
    return {
      success: false,
      message: `Error processing charge success: ${charge.id}`,
      error,
    }
  }
}

// Handler for charge failed events
async function handleChargeFailed(charge: Stripe.Charge): Promise<WebhookProcessingResult> {
  try {
    console.log(`Charge failed: ${charge.id}`)

    // In a real app, you would update your database with the failed charge details
    // await db.charges.create({...})

    return {
      success: true,
      message: `Charge failed: ${charge.id}`,
      data: {
        chargeId: charge.id,
        amount: charge.amount,
        status: charge.status,
        failureCode: charge.failure_code,
        failureMessage: charge.failure_message,
      },
    }
  } catch (error) {
    logError(`Error processing charge failure: ${charge.id}`, error)
    return {
      success: false,
      message: `Error processing charge failure: ${charge.id}`,
      error,
    }
  }
}

// Handler for checkout session completed events
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<WebhookProcessingResult> {
  try {
    console.log(`Checkout session completed: ${session.id}`)

    // In a real app, you would update your database with the session details
    // await db.orders.update({...})

    return {
      success: true,
      message: `Checkout session completed: ${session.id}`,
      data: {
        sessionId: session.id,
        customerId: session.customer,
        amount: session.amount_total,
        status: session.status,
      },
    }
  } catch (error) {
    logError(`Error processing checkout session completion: ${session.id}`, error)
    return {
      success: false,
      message: `Error processing checkout session completion: ${session.id}`,
      error,
    }
  }
}

// Handler for customer events
async function handleCustomerEvent(eventType: string, customer: Stripe.Customer): Promise<WebhookProcessingResult> {
  try {
    console.log(`Customer event ${eventType}: ${customer.id}`)

    // In a real app, you would update your database with the customer details
    // await db.customers.update({...})

    return {
      success: true,
      message: `Customer event ${eventType}: ${customer.id}`,
      data: {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
      },
    }
  } catch (error) {
    logError(`Error processing customer event ${eventType}: ${customer.id}`, error)
    return {
      success: false,
      message: `Error processing customer event ${eventType}: ${customer.id}`,
      error,
    }
  }
}
