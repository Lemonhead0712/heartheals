import Stripe from "stripe"

// Initialize Stripe with the secret key from environment variables
export const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Stripe secret key is missing")
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  })
}

// Get the publishable key for client-side usage
export const getPublishableKey = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    throw new Error("Stripe publishable key is missing")
  }

  return publishableKey
}

// Validate that Stripe is properly configured
export const validateStripeConfig = async (): Promise<{ isValid: boolean; message?: string }> => {
  try {
    const stripe = getStripeInstance()

    // Make a simple API call to verify the key works
    await stripe.balance.retrieve()

    return { isValid: true }
  } catch (error) {
    console.error("Stripe configuration validation failed:", error)

    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      return {
        isValid: false,
        message: "Invalid API key provided. Please check your Stripe secret key.",
      }
    }

    return {
      isValid: false,
      message: error instanceof Error ? error.message : "Unknown error validating Stripe configuration",
    }
  }
}
