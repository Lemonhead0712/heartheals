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

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send confirmation email", details: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (error) {
    console.error("Error in send-confirmation route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
