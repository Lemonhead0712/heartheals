// Map Stripe error codes to user-friendly messages
export const paymentErrorMessages: Record<string, string> = {
  card_declined: "Your card was declined. Please try another payment method.",
  expired_card: "Your card has expired. Please use a different card.",
  incorrect_cvc: "The security code (CVC) is incorrect. Please check and try again.",
  processing_error: "There was an error processing your card. Please try again in a few moments.",
  insufficient_funds: "Your card has insufficient funds. Please use a different payment method.",
  invalid_expiry_month: "The expiration month is invalid. Please check and try again.",
  invalid_expiry_year: "The expiration year is invalid. Please check and try again.",
  rate_limit: "Too many payment attempts. Please wait a moment before trying again.",
  invalid_number: "Your card number is invalid. Please check and try again.",
  authentication_required: "This payment requires authentication. Please complete the verification process.",
  network_error: "A network error occurred. Please check your connection and try again.",
  api_connection_error: "We're having trouble connecting to our payment provider. Please try again later.",
  api_error: "Our payment system encountered an error. Our team has been notified.",
}

// Get a user-friendly error message from a Stripe error
export function getUserFriendlyErrorMessage(error: any): string {
  // Extract error code from Stripe error object
  const errorCode = error?.code || error?.decline_code || (error?.type === "StripeCardError" ? "card_declined" : null)

  // Return user-friendly message if available, otherwise return the original message
  return errorCode && paymentErrorMessages[errorCode]
    ? paymentErrorMessages[errorCode]
    : error?.message || "An unexpected error occurred. Please try again."
}
