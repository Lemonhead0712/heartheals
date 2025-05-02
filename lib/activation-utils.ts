import { safeLocalStorage, safeJsonParse } from "@/utils/error-utils"

// Status types for tracking the activation process
export type ActivationStatus = {
  paymentComplete: boolean
  accountCreated: boolean
  activationComplete: boolean
  paymentDetails?: {
    paymentId?: string
    amount?: number
    timestamp?: string
    method?: string
  }
  errors?: string[]
}

// Keys for storing activation data
const ACTIVATION_STATUS_KEY = "heartsHeal_activationStatus"
const PAYMENT_INFO_KEY = "heartsHeal_paymentInfo"

/**
 * Initialize or retrieve the current activation status
 */
export function getActivationStatus(): ActivationStatus {
  const stored = safeLocalStorage(ACTIVATION_STATUS_KEY, "get")

  if (stored) {
    try {
      return safeJsonParse(stored, {
        paymentComplete: false,
        accountCreated: false,
        activationComplete: false,
      })
    } catch (error) {
      console.error("Error parsing activation status:", error)
    }
  }

  // Default status if not found or error
  return {
    paymentComplete: false,
    accountCreated: false,
    activationComplete: false,
  }
}

/**
 * Update the activation status
 */
export function updateActivationStatus(updates: Partial<ActivationStatus>): ActivationStatus {
  const current = getActivationStatus()
  const updated = { ...current, ...updates }

  // Check if both payment and account creation are complete
  if (updated.paymentComplete && updated.accountCreated && !updated.activationComplete) {
    updated.activationComplete = true
  }

  safeLocalStorage(ACTIVATION_STATUS_KEY, "set", JSON.stringify(updated))
  return updated
}

/**
 * Mark payment as complete and store payment details
 */
export function markPaymentComplete(paymentDetails: {
  paymentId?: string
  amount?: number
  method?: string
}): ActivationStatus {
  return updateActivationStatus({
    paymentComplete: true,
    paymentDetails: {
      ...paymentDetails,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Mark account creation as complete
 */
export function markAccountCreated(): ActivationStatus {
  return updateActivationStatus({
    accountCreated: true,
  })
}

/**
 * Check if payment info exists from a previous payment
 */
export function checkExistingPayment(): boolean {
  const paymentInfo = safeLocalStorage(PAYMENT_INFO_KEY, "get")
  if (!paymentInfo) return false

  try {
    const parsed = safeJsonParse(paymentInfo, null)
    return parsed && parsed.status === "completed"
  } catch (error) {
    console.error("Error checking existing payment:", error)
    return false
  }
}

/**
 * Clear activation status after successful activation
 * or when starting a new activation process
 */
export function resetActivationStatus(): void {
  safeLocalStorage(ACTIVATION_STATUS_KEY, "remove")
}

/**
 * Get payment details from stored payment info
 */
export function getStoredPaymentDetails() {
  const paymentInfo = safeLocalStorage(PAYMENT_INFO_KEY, "get")
  if (!paymentInfo) return null

  try {
    return safeJsonParse(paymentInfo, null)
  } catch (error) {
    console.error("Error parsing payment info:", error)
    return null
  }
}
