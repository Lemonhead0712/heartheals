import { NextResponse } from "next/server"
import { validateStripeConfig } from "@/lib/stripe"

export async function GET() {
  try {
    const result = await validateStripeConfig()

    if (result.isValid) {
      return NextResponse.json({ status: "ok" })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: result.message || "Stripe configuration is invalid",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error validating Stripe configuration:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
