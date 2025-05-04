// Simple in-memory rate limiter
// In production, use Redis or a similar service for distributed rate limiting

interface RateLimitRecord {
  count: number
  resetTime: number
}

const ipLimits: Map<string, RateLimitRecord> = new Map()
const emailLimits: Map<string, RateLimitRecord> = new Map()

export interface RateLimitOptions {
  maxRequests: number // Maximum number of requests allowed
  windowMs: number // Time window in milliseconds
  identifier: string // Unique identifier (IP, email, etc.)
}

export interface RateLimitResult {
  success: boolean // Whether the request is allowed
  remaining: number // Number of requests remaining
  resetTime: number // Time when the rate limit resets
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { maxRequests, windowMs, identifier } = options
  const now = Date.now()
  const limitsMap = identifier.includes("@") ? emailLimits : ipLimits

  // Get or create rate limit record
  let record = limitsMap.get(identifier)

  if (!record || now > record.resetTime) {
    // Create new record if none exists or if the window has expired
    record = {
      count: 0,
      resetTime: now + windowMs,
    }
  }

  // Check if limit is exceeded
  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Increment count and update record
  record.count += 1
  limitsMap.set(identifier, record)

  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

// Clean up expired records periodically
setInterval(() => {
  const now = Date.now()

  for (const [key, record] of ipLimits.entries()) {
    if (now > record.resetTime) {
      ipLimits.delete(key)
    }
  }

  for (const [key, record] of emailLimits.entries()) {
    if (now > record.resetTime) {
      emailLimits.delete(key)
    }
  }
}, 60000) // Clean up every minute
