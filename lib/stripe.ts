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

// Update the validateStripeConfig function to better handle test mode
export const validateStripeConfig = async (): Promise<{ isValid: boolean; message?: string; isTestMode?: boolean }> => {
  try {
    // Check if environment variables are set
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!secretKey) {
      return {
        isValid: false,
        message: "Stripe secret key is missing. Please check your environment variables.",
      }
    }

    if (!publishableKey) {
      return {
        isValid: false,
        message: "Stripe publishable key is missing. Please check your environment variables.",
      }
    }

    // Check if we're in test mode
    const isTestMode = secretKey.includes("test") || publishableKey.includes("test")

    // Initialize Stripe with the secret key
    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    })

    // Make a simple API call to verify the key works
    await stripe.balance.retrieve()

    return {
      isValid: true,
      isTestMode,
    }
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

// Add a new function to get test card details
export const getTestCardDetails = () => {
  return {
    success: {
      number: "4242 4242 4242 4242",
      exp_month: "12",
      exp_year: (new Date().getFullYear() + 1).toString().substr(-2),
      cvc: "424",
      zip: "42424",
    },
    decline: {
      number: "4000 0000 0000 0002",
      exp_month: "12",
      exp_year: (new Date().getFullYear() + 1).toString().substr(-2),
      cvc: "424",
      zip: "42424",
    },
    insufficient_funds: {
      number: "4000 0000 0000 9995",
      exp_month: "12",
      exp_year: (new Date().getFullYear() + 1).toString().substr(-2),
      cvc: "424",
      zip: "42424",
    },
  }
}
