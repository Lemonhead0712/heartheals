// Types for Stripe errors
export type StripeErrorType =
  | "card_declined"
  | "insufficient_funds"
  | "expired_card"
  | "incorrect_cvc"
  | "processing_error"
  | "incorrect_number"
  | "invalid_expiry_month"
  | "invalid_expiry_year"
  | "invalid_number"
  | "api_error"
  | "rate_limit_error"
  | "authentication_error"
  | "unknown_error"

export interface ParsedPaymentError {
  code: StripeErrorType
  message: string
  declineCode?: string
  actionRequired?: boolean
}

// Parse Stripe error response
export function parseStripeError(error: any): ParsedPaymentError {
  // Handle Stripe.js errors
  if (error?.type && error?.code) {
    return {
      code: error.code as StripeErrorType,
      message: error.message || "An error occurred with your payment",
      declineCode: error.decline_code,
      actionRequired: error.payment_intent?.status === "requires_action",
    }
  }

  // Handle API response errors
  if (error?.error?.code) {
    return {
      code: error.error.code as StripeErrorType,
      message: error.error.message || "An error occurred with your payment",
      declineCode: error.error.decline_code,
      actionRequired: false,
    }
  }

  // Handle string error messages
  if (typeof error === "string") {
    // Try to infer error type from message
    const message = error.toLowerCase()
    let code: StripeErrorType = "unknown_error"

    if (message.includes("declined")) code = "card_declined"
    else if (message.includes("insufficient") || message.includes("funds")) code = "insufficient_funds"
    else if (message.includes("expired")) code = "expired_card"
    else if (message.includes("cvc") || message.includes("security code")) code = "incorrect_cvc"
    else if (message.includes("processing")) code = "processing_error"
    else if (message.includes("card number") || message.includes("incorrect number")) code = "incorrect_number"

    return {
      code,
      message: error,
      actionRequired: false,
    }
  }

  // Default unknown error
  return {
    code: "unknown_error",
    message: "An unknown error occurred with your payment",
    actionRequired: false,
  }
}

// Log payment errors for monitoring
export function logPaymentError(error: any, context = "payment_process"): void {
  const parsedError = parseStripeError(error)

  // In production, you would send this to your logging service
  console.error(`[${context}] Payment Error:`, {
    code: parsedError.code,
    message: parsedError.message,
    declineCode: parsedError.declineCode,
    timestamp: new Date().toISOString(),
    actionRequired: parsedError.actionRequired,
  })
}

// Get user-friendly message based on error
export function getUserFriendlyErrorMessage(error: any): string {
  const parsedError = parseStripeError(error)

  // Map error codes to user-friendly messages
  const errorMessages: Record<StripeErrorType, string> = {
    card_declined: "Your card was declined. Please try another card or contact your bank.",
    insufficient_funds: "Your card has insufficient funds. Please use another card.",
    expired_card: "Your card has expired. Please use a different card.",
    incorrect_cvc: "The security code you entered is incorrect. Please check and try again.",
    processing_error: "An error occurred while processing your card. Please try again.",
    incorrect_number: "The card number you entered is incorrect. Please check and try again.",
    invalid_expiry_month: "The expiration month is invalid. Please check and try again.",
    invalid_expiry_year: "The expiration year is invalid. Please check and try again.",
    invalid_number: "The card number is invalid. Please check and try again.",
    api_error: "We encountered a system error. Please try again later.",
    rate_limit_error: "Too many requests. Please try again later.",
    authentication_error: "Authentication failed. Please try again.",
    unknown_error: "An error occurred with your payment. Please try again or use a different card.",
  }

  return errorMessages[parsedError.code] || parsedError.message
}
