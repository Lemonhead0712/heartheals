import { NextResponse } from "next/server"
import { sendSubscriptionConfirmationEmail } from "@/lib/email-utils"

export async function POST(request: Request) {
  try {
    const { email, userName, subscriptionPlan, amount } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await sendSubscriptionConfirmationEmail({
      email,
      userName: userName || "Valued User",
      subscriptionPlan,
      amount,
    })

    // Handle development mode
    if (result.devMode) {
      return NextResponse.json({
        success: true,
        emailSent: true,
        devMode: true,
        message: "Email logged in development mode (not actually sent)",
      })
    }

    if (!result.success) {
      const errorMessage = result.errorDetails || "Failed to send confirmation email"
      console.warn(errorMessage, result.error)

      // Return a partial success to prevent breaking the payment flow
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: "Confirmation email could not be sent, but your subscription is active.",
        details: errorMessage,
      })
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      messageId: result.data?.id,
    })
  } catch (error) {
    console.error("Error in send-confirmation route:", error)
    // Return a partial success to prevent breaking the payment flow
    return NextResponse.json({
      success: true,
      emailSent: false,
      warning: "Confirmation email could not be sent, but your subscription is active.",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
