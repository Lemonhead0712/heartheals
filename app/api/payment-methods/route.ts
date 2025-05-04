import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripeInstance } from "@/lib/stripe"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { logPaymentEvent } from "@/lib/payment-logger"
import { handleApiError } from "@/utils/error-utils"

// Enhanced timeout wrapper for Stripe API calls
async function stripeApiCall<T>(apiFunction: () => Promise<T>, context: string): Promise<T> {
  try {
    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${context} operation timed out`)), 10000)
    })

    // Race the API call against the timeout
    return await Promise.race([apiFunction(), timeoutPromise])
  } catch (error) {
    // Log the error
    logPaymentEvent(`${context}_failed`, {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const customerId = url.searchParams.get("customerId")

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the customer ID belongs to the authenticated user
    if (user.customerId !== customerId) {
      logPaymentEvent("unauthorized_payment_method_access", {
        requestedCustomerId: customerId,
        userCustomerId: user.customerId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const stripe = getStripeInstance()

    // Use the enhanced API call with timeout
    const paymentMethods = await stripeApiCall(
      () =>
        stripe.paymentMethods.list({
          customer: customerId,
          type: "card",
        }),
      "fetch_payment_methods",
    )

    // Log successful retrieval
    logPaymentEvent("payment_methods_retrieved", {
      customerId,
      count: paymentMethods.data.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ paymentMethods: paymentMethods.data })
  } catch (error) {
    console.error("Error fetching payment methods:", error)

    // Use the enhanced error handler
    const errorResponse = handleApiError(error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: `Payment service error: ${error.message}`,
          code: error.code,
          type: error.type,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch payment methods",
        details: errorResponse.details,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, paymentMethodId } = await request.json()

    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the customer ID belongs to the authenticated user
    if (user.customerId !== customerId) {
      logPaymentEvent("unauthorized_payment_method_update", {
        requestedCustomerId: customerId,
        userCustomerId: user.customerId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    if (!customerId || !paymentMethodId) {
      return NextResponse.json({ error: "Customer ID and payment method ID are required" }, { status: 400 })
    }

    const stripe = getStripeInstance()

    // Use the enhanced API call with timeout for attaching payment method
    await stripeApiCall(
      () =>
        stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        }),
      "attach_payment_method",
    )

    // Use the enhanced API call with timeout for updating default payment method
    await stripeApiCall(
      () =>
        stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        }),
      "update_default_payment_method",
    )

    // Log successful payment method attachment
    logPaymentEvent("payment_method_attached", {
      customerId,
      paymentMethodId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error attaching payment method:", error)

    // Use the enhanced error handler
    const errorResponse = handleApiError(error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: `Payment service error: ${error.message}`,
          code: error.code,
          type: error.type,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to attach payment method",
        details: errorResponse.details,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const paymentMethodId = url.searchParams.get("paymentMethodId")
  const customerId = url.searchParams.get("customerId")

  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the customer ID belongs to the authenticated user
    if (customerId && user.customerId !== customerId) {
      logPaymentEvent("unauthorized_payment_method_deletion", {
        requestedCustomerId: customerId,
        userCustomerId: user.customerId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    const stripe = getStripeInstance()

    // Verify the payment method belongs to the user before detaching
    const paymentMethod = await stripeApiCall(
      () => stripe.paymentMethods.retrieve(paymentMethodId),
      "retrieve_payment_method",
    )

    if (paymentMethod.customer !== user.customerId) {
      logPaymentEvent("unauthorized_payment_method_deletion", {
        paymentMethodId,
        paymentMethodCustomer: paymentMethod.customer,
        userCustomerId: user.customerId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({ error: "Unauthorized access to payment method" }, { status: 403 })
    }

    // Use the enhanced API call with timeout
    await stripeApiCall(() => stripe.paymentMethods.detach(paymentMethodId), "detach_payment_method")

    // Log successful payment method detachment
    logPaymentEvent("payment_method_detached", {
      paymentMethodId,
      customerId: user.customerId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error detaching payment method:", error)

    // Use the enhanced error handler
    const errorResponse = handleApiError(error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: `Payment service error: ${error.message}`,
          code: error.code,
          type: error.type,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to detach payment method",
        details: errorResponse.details,
      },
      { status: 500 },
    )
  }
}
