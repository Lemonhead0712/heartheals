import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripeInstance } from "@/lib/stripe"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const customerId = url.searchParams.get("customerId")

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
  }

  try {
    const stripe = getStripeInstance()

    // Retrieve payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })

    return NextResponse.json({ paymentMethods: paymentMethods.data })
  } catch (error) {
    console.error("Error fetching payment methods:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Payment service error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, paymentMethodId } = await request.json()

    if (!customerId || !paymentMethodId) {
      return NextResponse.json({ error: "Customer ID and payment method ID are required" }, { status: 400 })
    }

    const stripe = getStripeInstance()

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error attaching payment method:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Payment service error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to attach payment method" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const paymentMethodId = url.searchParams.get("paymentMethodId")

  if (!paymentMethodId) {
    return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
  }

  try {
    const stripe = getStripeInstance()

    // Detach the payment method
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error detaching payment method:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Payment service error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to detach payment method" }, { status: 500 })
  }
}
