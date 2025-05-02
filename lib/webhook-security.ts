import { logError } from "@/utils/error-utils"
import crypto from "crypto"
import type Stripe from "stripe"

// Verify Stripe webhook signature
export function verifyStripeSignature(
  payload: string,
  signature: string,
  webhookSecret: string,
): { isValid: boolean; event?: Stripe.Event; error?: Error } {
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

// Verify timestamp is recent (within 5 minutes)
export function verifyTimestamp(timestamp: number): boolean {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  return timestamp >= fiveMinutesAgo
}

// Generate HMAC signature for payload
export function generateHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

// Verify HMAC signature
export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateHmacSignature(payload, secret)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

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
