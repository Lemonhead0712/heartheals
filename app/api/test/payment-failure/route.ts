import { NextResponse } from "next/server"
import { sendPaymentFailureEmail } from "@/lib/email-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, userName } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await sendPaymentFailureEmail({
      email,
      userName: userName || "Test User",
      invoiceId: "inv_test_12345",
      amount: "$5.00",
      failureReason: "Your card was declined. Please try another payment method.",
      paymentMethod: "VISA •••• 4242",
      subscriptionPlan: "Premium",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending test payment failure email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
