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

export async function GET(request: Request) {
  try {
    // In a real app, you would get the customer ID from the authenticated user
    // For this example, we'll use a test customer ID
    const customerId = "cus_XXXXXXXXXXXXXXX"

    // Determine if we're in test mode (in a real app, this might come from user settings or environment)
    const isTestMode = true

    const stripe = getStripeInstance(isTestMode)

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${new URL(request.url).origin}/subscription`,
    })

    // Redirect to the portal
    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.redirect(`${new URL(request.url).origin}/subscription?error=portal_failed`)
  }
}
