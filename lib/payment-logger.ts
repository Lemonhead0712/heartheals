import { clientEnv } from "./environment"

// Define log levels
type LogLevel = "debug" | "info" | "warning" | "error" | "critical"

// Define payment event data structure
interface PaymentEventData {
  timestamp: string
  [key: string]: any
}

// Enhanced payment event logger
export function logPaymentEvent(stage: string, data: any, level: LogLevel = "info") {
  const timestamp = new Date().toISOString()
  const eventId = generateEventId()

  // Create structured log entry
  const logEntry = {
    id: eventId,
    timestamp,
    level,
    stage,
    environment: process.env.NODE_ENV || "development",
    data: sanitizePaymentData(data),
  }

  // Log to console with appropriate level
  switch (level) {
    case "debug":
      console.debug(`[${timestamp}] PAYMENT_FLOW | ${stage} |`, logEntry)
      break
    case "warning":
      console.warn(`[${timestamp}] PAYMENT_FLOW | ${stage} |`, logEntry)
      break
    case "error":
      console.error(`[${timestamp}] PAYMENT_FLOW | ${stage} |`, logEntry)
      break
    case "critical":
      console.error(`[${timestamp}] PAYMENT_FLOW | CRITICAL | ${stage} |`, logEntry)
      break
    default:
      console.log(`[${timestamp}] PAYMENT_FLOW | ${stage} |`, logEntry)
  }

  // In development, store in localStorage for debugging
  if (typeof window !== "undefined" && clientEnv.isDevelopment) {
    try {
      const logs = JSON.parse(localStorage.getItem("payment_flow_logs") || "[]")
      logs.push(logEntry)
      localStorage.setItem("payment_flow_logs", JSON.stringify(logs.slice(-50)))
    } catch (error) {
      console.error("Error storing payment log:", error)
    }
  }

  // In a production environment, you would send this to a logging service
  // For example:
  if (process.env.NODE_ENV === "production") {
    // This is where you would send logs to your logging service
    // Example: sendToLoggingService(logEntry)
  }

  return eventId
}

// Generate a unique ID for each event
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Sanitize payment data to remove sensitive information
function sanitizePaymentData(data: any): any {
  if (!data) return data

  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data))

  // List of fields to redact
  const sensitiveFields = ["card", "cardNumber", "cvc", "cvv", "expiryMonth", "expiryYear", "password", "securityCode"]

  // Function to recursively sanitize objects
  function sanitizeObject(obj: any) {
    if (!obj || typeof obj !== "object") return

    Object.keys(obj).forEach((key) => {
      // Check if this is a sensitive field
      if (sensitiveFields.includes(key)) {
        // Redact the value, preserving the type
        if (typeof obj[key] === "string") {
          // For strings, keep first and last character
          const value = obj[key]
          if (value.length > 2) {
            obj[key] = value[0] + "•".repeat(value.length - 2) + value[value.length - 1]
          } else {
            obj[key] = "•".repeat(value.length)
          }
        } else if (typeof obj[key] === "number") {
          // For numbers, just indicate it was a number
          obj[key] = "[REDACTED NUMBER]"
        } else {
          obj[key] = "[REDACTED]"
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // Recursively sanitize nested objects
        sanitizeObject(obj[key])
      }
    })
  }

  sanitizeObject(sanitized)
  return sanitized
}

// Function to log payment errors with context
export function logPaymentError(context: string, error: unknown, data: any = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  return logPaymentEvent(
    "payment_error",
    {
      context,
      error: errorMessage,
      stack: errorStack,
      ...data,
    },
    "error",
  )
}

// Function to log security concerns
export function logSecurityEvent(action: string, data: any) {
  return logPaymentEvent(
    "security_event",
    {
      action,
      ...data,
    },
    "warning",
  )
}
