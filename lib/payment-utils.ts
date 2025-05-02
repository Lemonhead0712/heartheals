import type Stripe from "stripe"
import { getStripeInstance } from "./stripe"

// Supported currencies with their minimum and default amounts
export const SUPPORTED_CURRENCIES = {
  usd: { symbol: "$", minimum: 50, default: 500 },
  eur: { symbol: "€", minimum: 50, default: 500 },
  gbp: { symbol: "£", minimum: 50, default: 500 },
  cad: { symbol: "C$", minimum: 50, default: 500 },
  aud: { symbol: "A$", minimum: 50, default: 500 },
  jpy: { symbol: "¥", minimum: 50, default: 500 },
}

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES

// Format amount for display based on currency
export function formatAmount(amount: number, currency: SupportedCurrency = "usd"): string {
  const { symbol } = SUPPORTED_CURRENCIES[currency]

  // Special case for JPY which doesn't use decimal places
  if (currency === "jpy") {
    return `${symbol}${amount}`
  }

  return `${symbol}${(amount / 100).toFixed(2)}`
}

// Get payment methods for a customer
export async function getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    const stripe = getStripeInstance()
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })
    return paymentMethods.data
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return []
  }
}

// Format card details for display
export function formatCardDetails(card: Stripe.PaymentMethod.Card): string {
  return `${card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• ${card.last4} (expires ${card.exp_month}/${card.exp_year})`
}

// Create a setup intent for saving payment methods
export async function createSetupIntent(customerId: string): Promise<string | null> {
  try {
    const stripe = getStripeInstance()
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    })
    return setupIntent.client_secret
  } catch (error) {
    console.error("Error creating setup intent:", error)
    return null
  }
}

// Validate payment amount
export function validatePaymentAmount(amount: number, currency: SupportedCurrency = "usd"): boolean {
  const { minimum } = SUPPORTED_CURRENCIES[currency]
  return amount >= minimum
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const stripe = getStripeInstance()
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return null
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const stripe = getStripeInstance()
    await stripe.subscriptions.cancel(subscriptionId)
    return true
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return false
  }
}

// Update subscription payment method
export async function updateSubscriptionPaymentMethod(
  subscriptionId: string,
  paymentMethodId: string,
): Promise<boolean> {
  try {
    const stripe = getStripeInstance()
    await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
    })
    return true
  } catch (error) {
    console.error("Error updating subscription payment method:", error)
    return false
  }
}

// Create a customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  try {
    const stripe = getStripeInstance()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session.url
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return null
  }
}
