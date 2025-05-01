/**
 * Utility functions for payment validation
 */

// Validate credit card number using Luhn algorithm
export function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and dashes
  const sanitizedNumber = cardNumber.replace(/[\s-]/g, "")

  // Check if it contains only digits
  if (!/^\d+$/.test(sanitizedNumber)) {
    return false
  }

  // Check length (most cards are between 13-19 digits)
  if (sanitizedNumber.length < 13 || sanitizedNumber.length > 19) {
    return false
  }

  // Luhn algorithm (checksum)
  let sum = 0
  let shouldDouble = false

  // Loop through values starting from the rightmost digit
  for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(sanitizedNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

// Validate expiry date (MM/YY format)
export function validateExpiryDate(expiryDate: string): boolean {
  // Check format
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false
  }

  const [monthStr, yearStr] = expiryDate.split("/")
  const month = Number.parseInt(monthStr, 10)
  const year = Number.parseInt(yearStr, 10) + 2000 // Convert to 4-digit year

  // Check month is valid
  if (month < 1 || month > 12) {
    return false
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed

  // Check if card is expired
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false
  }

  return true
}

// Validate CVV/CVC code
export function validateCvv(cvv: string, cardType: "amex" | "other" = "other"): boolean {
  // Amex cards have 4-digit CVV, others have 3-digit
  const expectedLength = cardType === "amex" ? 4 : 3

  // Check if it contains only digits and has correct length
  return /^\d+$/.test(cvv) && cvv.length === expectedLength
}

// Validate email format
export function validateEmail(email: string): boolean {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Detect card type from number
export function detectCardType(cardNumber: string): "visa" | "mastercard" | "amex" | "discover" | "unknown" {
  // Remove spaces and dashes
  const sanitizedNumber = cardNumber.replace(/[\s-]/g, "")

  // Visa: Starts with 4
  if (/^4/.test(sanitizedNumber)) {
    return "visa"
  }

  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(sanitizedNumber) || /^2[2-7][2-7]\d/.test(sanitizedNumber)) {
    return "mastercard"
  }

  // American Express: Starts with 34 or 37
  if (/^3[47]/.test(sanitizedNumber)) {
    return "amex"
  }

  // Discover: Starts with 6011, 622126-622925, 644-649, or 65
  if (
    /^6011/.test(sanitizedNumber) ||
    /^65/.test(sanitizedNumber) ||
    /^64[4-9]/.test(sanitizedNumber) ||
    /^622(12[6-9]|1[3-9]|[2-8]|9[0-1])/.test(sanitizedNumber)
  ) {
    return "discover"
  }

  return "unknown"
}

// Format card number with spaces for display
export function formatCardNumber(cardNumber: string): string {
  const sanitizedNumber = cardNumber.replace(/[\s-]/g, "")
  const cardType = detectCardType(sanitizedNumber)

  // Different card types have different grouping patterns
  if (cardType === "amex") {
    // American Express: 4-6-5 pattern
    return sanitizedNumber.replace(/^(\d{4})(\d{6})(\d{5})$/, "$1 $2 $3")
  } else {
    // Most cards: 4-4-4-4 pattern
    return sanitizedNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
  }
}
