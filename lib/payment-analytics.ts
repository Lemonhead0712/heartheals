// Types for payment events
export type PaymentEvent =
  | "payment_initiated"
  | "payment_succeeded"
  | "payment_failed"
  | "form_validation_error"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_canceled"

// Types for payment analytics data
export interface PaymentAnalyticsData {
  eventType: PaymentEvent
  amount?: number
  currency?: string
  errorType?: string
  errorMessage?: string
  paymentMethod?: string
  subscriptionTier?: string
  timestamp: number
  sessionId: string
  [key: string]: any // Allow for additional properties
}

// Generate a session ID for tracking
const getSessionId = (): string => {
  // Try to get existing session ID from storage
  const existingId = localStorage.getItem("heartsHeal_analytics_session")
  if (existingId) return existingId

  // Create new session ID if none exists
  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  localStorage.setItem("heartsHeal_analytics_session", newId)
  return newId
}

// Track payment events
export async function trackPaymentEvent(event: PaymentEvent, data: Partial<PaymentAnalyticsData> = {}): Promise<void> {
  try {
    const sessionId = getSessionId()

    const analyticsData: PaymentAnalyticsData = {
      eventType: event,
      timestamp: Date.now(),
      sessionId,
      ...data,
    }

    // Log to console during development
    console.log(`[Payment Analytics] ${event}`, analyticsData)

    // In production, send to analytics endpoint
    if (process.env.NODE_ENV === "production") {
      await fetch("/api/analytics/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analyticsData),
        // Use keepalive to ensure the request completes even if the page is unloaded
        keepalive: true,
      })
    }

    // Store last 10 events in local storage for debugging
    const storedEvents = JSON.parse(localStorage.getItem("heartsHeal_payment_events") || "[]")
    storedEvents.unshift(analyticsData)
    localStorage.setItem("heartsHeal_payment_events", JSON.stringify(storedEvents.slice(0, 10)))
  } catch (error) {
    // Fail silently - analytics should never break the main application
    console.error("Error tracking payment event:", error)
  }
}

// Add the missing recordPaymentAnalytics export
// This should be added after the existing trackPaymentEvent function

// Add this new export function that wraps the existing trackPaymentEvent function
export async function recordPaymentAnalytics(
  event: PaymentEvent,
  data: Partial<PaymentAnalyticsData> = {},
): Promise<void> {
  return trackPaymentEvent(event, data)
}
