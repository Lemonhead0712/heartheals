import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { logPaymentEvent } from "@/lib/payment-logger"

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user || !user.customerId) {
      return NextResponse.redirect(
        `${new URL(request.url).origin}/login?redirect=${encodeURIComponent("/subscription")}`,
      )
    }

    // Use the getStripeInstance utility to get a properly configured Stripe instance
    const stripe = getStripeInstance()

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: `${new URL(request.url).origin}/subscription`,
    })

    // Log the portal session creation
    logPaymentEvent("portal_session_created", {
      customerId: user.customerId,
      userId: user.id,
      timestamp: new Date().toISOString(),
    })

    // Redirect to the portal
    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error("Error creating portal session:", error)

    // Log the error
    logPaymentEvent("portal_session_failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.redirect(`${new URL(request.url).origin}/subscription?error=portal_failed`)
  }
}
