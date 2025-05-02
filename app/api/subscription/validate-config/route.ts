import { NextResponse } from "next/server"
import { validateStripeConfig } from "@/lib/stripe"

export async function GET() {
  try {
    const result = await validateStripeConfig()

    if (!result.isValid) {
      return NextResponse.json(
        {
          status: "error",
          message: result.message || "Stripe configuration is invalid",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      status: "ok",
      isTestMode: result.isTestMode || false,
    })
  } catch (error) {
    console.error("Error validating Stripe configuration:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to validate Stripe configuration",
      },
      { status: 500 },
    )
  }
}
