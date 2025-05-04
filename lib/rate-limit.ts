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

// Add the missing rateLimit function as a middleware-style function
export const rateLimit = (options: {
  maxRequests: number
  windowMs: number
  identifierFunction?: (req: Request) => string
}) => {
  return async (req: Request): Promise<Response | null> => {
    const { maxRequests, windowMs, identifierFunction } = options

    // Default identifier is the IP address from the x-forwarded-for header
    // or a fallback string if not available
    const defaultIdentifier = (req: Request): string => {
      const forwardedFor = req.headers.get("x-forwarded-for")
      return forwardedFor?.split(",")[0] || "unknown-ip"
    }

    const identifier = identifierFunction ? identifierFunction(req) : defaultIdentifier(req)

    const result = checkRateLimit({
      maxRequests,
      windowMs,
      identifier,
    })

    if (!result.success) {
      // If rate limit is exceeded, return a 429 Too Many Requests response
      const resetDate = new Date(result.resetTime).toUTCString()
      return new Response(
        JSON.stringify({
          error: "Too many requests, please try again later.",
          resetTime: resetDate,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetDate,
          },
        },
      )
    }

    // If rate limit is not exceeded, return null to continue processing the request
    return null
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
