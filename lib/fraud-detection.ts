import { logSecurityEvent } from "./payment-logger"

// Define thresholds for fraud detection
const THRESHOLDS = {
  MAX_ATTEMPTS_PER_IP: 5,
  MAX_ATTEMPTS_PER_CARD: 3,
  MAX_ATTEMPTS_PER_EMAIL: 5,
  SUSPICIOUS_AMOUNT_CHANGE: 0.5, // 50% change in amount
  TIME_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
}

// In-memory store for attempts (in a real app, use Redis or similar)
// Note: This is not suitable for production as it doesn't persist across restarts
// and doesn't work in a multi-server environment
const attemptStore: {
  byIp: Record<string, { count: number; timestamps: number[] }>
  byCard: Record<string, { count: number; timestamps: number[] }>
  byEmail: Record<string, { count: number; timestamps: number[]; amounts: number[] }>
} = {
  byIp: {},
  byCard: {},
  byEmail: {},
}

// Clean up old entries periodically
setInterval(
  () => {
    const now = Date.now()
    const cutoff = now - THRESHOLDS.TIME_WINDOW_MS

    // Clean up IP records
    Object.keys(attemptStore.byIp).forEach((ip) => {
      attemptStore.byIp[ip].timestamps = attemptStore.byIp[ip].timestamps.filter((t) => t > cutoff)
      attemptStore.byIp[ip].count = attemptStore.byIp[ip].timestamps.length
      if (attemptStore.byIp[ip].count === 0) {
        delete attemptStore.byIp[ip]
      }
    })

    // Clean up card records
    Object.keys(attemptStore.byCard).forEach((card) => {
      attemptStore.byCard[card].timestamps = attemptStore.byCard[card].timestamps.filter((t) => t > cutoff)
      attemptStore.byCard[card].count = attemptStore.byCard[card].timestamps.length
      if (attemptStore.byCard[card].count === 0) {
        delete attemptStore.byCard[card]
      }
    })

    // Clean up email records
    Object.keys(attemptStore.byEmail).forEach((email) => {
      attemptStore.byEmail[email].timestamps = attemptStore.byEmail[email].timestamps.filter((t) => t > cutoff)
      attemptStore.byEmail[email].count = attemptStore.byEmail[email].timestamps.length
      if (attemptStore.byEmail[email].count === 0) {
        delete attemptStore.byEmail[email]
      }
    })
  },
  5 * 60 * 1000,
) // Run every 5 minutes

// Interface for fraud check result
interface FraudCheckResult {
  isSuspicious: boolean
  reasons: string[]
  riskScore: number // 0-100, higher is riskier
}

// Check for suspicious payment activity
export async function checkForFraud(data: {
  ip?: string
  email?: string
  cardFingerprint?: string
  amount?: number
  userAgent?: string
  customerId?: string
}): Promise<FraudCheckResult> {
  const now = Date.now()
  const reasons: string[] = []
  let riskScore = 0

  // Track this attempt
  if (data.ip) {
    if (!attemptStore.byIp[data.ip]) {
      attemptStore.byIp[data.ip] = { count: 0, timestamps: [] }
    }
    attemptStore.byIp[data.ip].count++
    attemptStore.byIp[data.ip].timestamps.push(now)

    // Check for too many attempts from this IP
    if (attemptStore.byIp[data.ip].count > THRESHOLDS.MAX_ATTEMPTS_PER_IP) {
      reasons.push(`Too many payment attempts from IP: ${data.ip}`)
      riskScore += 30
    }
  }

  // Track card attempts if fingerprint is available
  if (data.cardFingerprint) {
    if (!attemptStore.byCard[data.cardFingerprint]) {
      attemptStore.byCard[data.cardFingerprint] = { count: 0, timestamps: [] }
    }
    attemptStore.byCard[data.cardFingerprint].count++
    attemptStore.byCard[data.cardFingerprint].timestamps.push(now)

    // Check for too many attempts with this card
    if (attemptStore.byCard[data.cardFingerprint].count > THRESHOLDS.MAX_ATTEMPTS_PER_CARD) {
      reasons.push(`Too many payment attempts with card: ${data.cardFingerprint.substring(0, 6)}...`)
      riskScore += 40
    }
  }

  // Track email attempts and amounts
  if (data.email) {
    if (!attemptStore.byEmail[data.email]) {
      attemptStore.byEmail[data.email] = { count: 0, timestamps: [], amounts: [] }
    }
    attemptStore.byEmail[data.email].count++
    attemptStore.byEmail[data.email].timestamps.push(now)

    // Track amount if provided
    if (data.amount) {
      attemptStore.byEmail[data.email].amounts.push(data.amount)

      // Check for suspicious amount changes
      const amounts = attemptStore.byEmail[data.email].amounts
      if (amounts.length > 1) {
        const prevAmount = amounts[amounts.length - 2]
        const currentAmount = amounts[amounts.length - 1]
        const change = Math.abs(currentAmount - prevAmount) / prevAmount

        if (change > THRESHOLDS.SUSPICIOUS_AMOUNT_CHANGE) {
          reasons.push(`Suspicious amount change: ${prevAmount} -> ${currentAmount}`)
          riskScore += 20
        }
      }
    }

    // Check for too many attempts with this email
    if (attemptStore.byEmail[data.email].count > THRESHOLDS.MAX_ATTEMPTS_PER_EMAIL) {
      reasons.push(`Too many payment attempts with email: ${data.email}`)
      riskScore += 25
    }
  }

  // Additional checks could be implemented here:
  // - Check for known fraudulent IPs
  // - Check for mismatched billing/shipping addresses
  // - Check for unusual user agent patterns
  // - Check for unusual time patterns (e.g., middle of the night)
  // - Check for unusual geographic locations

  // Log suspicious activity
  if (reasons.length > 0) {
    logSecurityEvent("suspicious_payment_attempt", {
      ip: data.ip,
      email: data.email,
      cardFingerprint: data.cardFingerprint ? `${data.cardFingerprint.substring(0, 6)}...` : undefined,
      amount: data.amount,
      riskScore,
      reasons,
      timestamp: new Date().toISOString(),
    })
  }

  return {
    isSuspicious: riskScore >= 50, // Consider suspicious if risk score is 50 or higher
    reasons,
    riskScore,
  }
}

// Record a failed payment attempt
export function recordFailedPayment(data: {
  ip?: string
  email?: string
  cardFingerprint?: string
  errorCode?: string
  customerId?: string
}): void {
  // Increment risk scores for failed attempts
  // In a real implementation, this would update a database

  logSecurityEvent("failed_payment", {
    ip: data.ip,
    email: data.email,
    cardFingerprint: data.cardFingerprint ? `${data.cardFingerprint.substring(0, 6)}...` : undefined,
    errorCode: data.errorCode,
    timestamp: new Date().toISOString(),
  })
}

// Record a successful payment
export function recordSuccessfulPayment(data: {
  ip?: string
  email?: string
  cardFingerprint?: string
  amount: number
  customerId?: string
}): void {
  // In a real implementation, this would update a database
  // to build a profile of normal payment patterns

  logSecurityEvent("successful_payment", {
    ip: data.ip,
    email: data.email,
    cardFingerprint: data.cardFingerprint ? `${data.cardFingerprint.substring(0, 6)}...` : undefined,
    amount: data.amount,
    timestamp: new Date().toISOString(),
  })
}
