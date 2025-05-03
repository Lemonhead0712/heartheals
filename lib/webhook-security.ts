import { logError } from "@/utils/error-utils"

// Rate limiting state (replace with Redis or similar in production)
const ipRequests: Record<string, { count: number; resetTime: number }> = {}

// Simple rate limiting function
export function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()

  // Initialize or reset if window has passed
  if (!ipRequests[ip] || ipRequests[ip].resetTime < now) {
    ipRequests[ip] = { count: 1, resetTime: now + windowMs }
    return true
  }

  // Increment and check
  ipRequests[ip].count++
  return ipRequests[ip].count <= limit
}

// Verify Stripe webhook signature
export function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string,
): { isValid: boolean; event?: any; error?: Error } {
  try {
    // Verify the signature using Stripe's library
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)

    return {
      isValid: true,
      event,
    }
  } catch (error) {
    logError("Stripe signature verification failed", error)
    return {
      isValid: false,
      error: error instanceof Error ? error : new Error("Unknown error verifying signature"),
    }
  }
}
