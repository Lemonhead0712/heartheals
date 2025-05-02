// Log payment attempt details
export function logPaymentAttempt(details: {
  amount: number
  email: string
  name: string
  isTestMode: boolean
  paymentIntentId?: string
}) {
  try {
    console.log(
      `[Payment Debug] Attempt: ${details.amount / 100} USD for ${details.email} (${details.name})${
        details.isTestMode ? " - TEST MODE" : ""
      }${details.paymentIntentId ? ` - ID: ${details.paymentIntentId}` : ""}`,
    )

    // In development, store in localStorage for debugging
    if (process.env.NODE_ENV === "development") {
      const attempts = JSON.parse(localStorage.getItem("heartsHeal_payment_attempts") || "[]")
      attempts.unshift({
        ...details,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem("heartsHeal_payment_attempts", JSON.stringify(attempts.slice(0, 10)))
    }
  } catch (error) {
    console.error("Error logging payment attempt:", error)
  }
}

// Log payment result
export function logPaymentResult(result: {
  success: boolean
  paymentIntentId: string
  amount: number
  error?: string
  errorCode?: string
  isTestMode: boolean
}) {
  try {
    if (result.success) {
      console.log(
        `[Payment Debug] Success: ${result.paymentIntentId} - ${result.amount / 100} USD${
          result.isTestMode ? " - TEST MODE" : ""
        }`,
      )
    } else {
      console.error(
        `[Payment Debug] Failure: ${result.paymentIntentId} - ${result.amount / 100} USD - Error: ${
          result.error || "Unknown"
        }${result.errorCode ? ` (${result.errorCode})` : ""}${result.isTestMode ? " - TEST MODE" : ""}`,
      )
    }

    // In development, store in localStorage for debugging
    if (process.env.NODE_ENV === "development") {
      const results = JSON.parse(localStorage.getItem("heartsHeal_payment_results") || "[]")
      results.unshift({
        ...result,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem("heartsHeal_payment_results", JSON.stringify(results.slice(0, 10)))
    }
  } catch (error) {
    console.error("Error logging payment result:", error)
  }
}

// Get payment debug info for support
export function getPaymentDebugInfo(): string {
  try {
    const attempts = JSON.parse(localStorage.getItem("heartsHeal_payment_attempts") || "[]")
    const results = JSON.parse(localStorage.getItem("heartsHeal_payment_results") || "[]")
    const events = JSON.parse(localStorage.getItem("heartsHeal_payment_events") || "[]")

    return JSON.stringify(
      {
        attempts,
        results,
        events,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          ? `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 8)}...`
          : "Not available",
        isTestMode: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes("test")
          : false,
      },
      null,
      2,
    )
  } catch (error) {
    console.error("Error getting payment debug info:", error)
    return JSON.stringify({ error: "Failed to get debug info" })
  }
}

// Clear payment debug data
export function clearPaymentDebugData(): void {
  try {
    localStorage.removeItem("heartsHeal_payment_attempts")
    localStorage.removeItem("heartsHeal_payment_results")
    localStorage.removeItem("heartsHeal_payment_events")
    console.log("[Payment Debug] Debug data cleared")
  } catch (error) {
    console.error("Error clearing payment debug data:", error)
  }
}

// Format Stripe error for logging
export function formatStripeError(error: any): {
  message: string
  code?: string
  type?: string
  decline_code?: string
} {
  if (!error) return { message: "Unknown error" }

  if (error instanceof Error) {
    if ("type" in error) {
      // This is likely a Stripe error
      const stripeError = error as any
      return {
        message: stripeError.message || "Unknown Stripe error",
        code: stripeError.code,
        type: stripeError.type,
        decline_code: stripeError.decline_code,
      }
    }
    return { message: error.message }
  }

  if (typeof error === "string") {
    return { message: error }
  }

  if (typeof error === "object") {
    return {
      message: error.message || "Unknown error object",
      code: error.code,
      type: error.type,
      decline_code: error.decline_code,
    }
  }

  return { message: "Unknown error format" }
}
