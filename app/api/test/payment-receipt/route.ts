import { NextResponse } from "next/server"
import { sendPaymentReceiptEmail } from "@/lib/email-utils"

export async function POST(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Test endpoints are disabled in production" }, { status: 403 })
    }

    const body = await request.json()
    const { email, userName } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await sendPaymentReceiptEmail({
      email,
      userName: userName || "Test User",
      invoiceId: "inv_test_" + Math.random().toString(36).substring(2, 10),
      amount: "$5.00",
      paymentMethod: "Visa •••• 4242",
      subscriptionPlan: "Premium",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending test payment receipt:", error)
    return NextResponse.json({ error: "Failed to send test payment receipt" }, { status: 500 })
  }
}
