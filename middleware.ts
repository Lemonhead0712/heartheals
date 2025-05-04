import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authMiddleware } from "./middleware/auth-middleware"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define payment-related routes that require authentication
  const paymentRoutes = [
    "/api/subscription/create-subscription",
    "/api/subscription/portal",
    "/api/payment-methods",
    "/api/subscription/create-payment-intent",
    "/subscription/manage",
  ]

  // Check if this is a payment route that requires authentication
  const isPaymentRoute = paymentRoutes.some((route) => path.startsWith(route))

  if (isPaymentRoute) {
    // Apply authentication middleware for payment routes
    return await authMiddleware(request)
  }

  // Only run security headers in production
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next()
  }

  // Check if the request is already using HTTPS
  const url = request.nextUrl.clone()
  const isHttps = request.headers.get("x-forwarded-proto") === "https"

  // Redirect to HTTPS if not already using it
  if (!isHttps) {
    url.protocol = "https:"
    return NextResponse.redirect(url)
  }

  // Add security headers
  const response = NextResponse.next()

  // HSTS header
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")

  // XSS protection
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Content Security Policy for payment pages
  if (path.startsWith("/subscription") || path.startsWith("/payment")) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com;",
    )
  }

  return response
}

// Run the middleware on all payment-related routes and API endpoints
export const config = {
  matcher: [
    "/subscription/:path*",
    "/api/subscription/:path*",
    "/api/payment-methods/:path*",
    "/api/webhooks/stripe/:path*",
    "/api/analytics/payment/:path*",
  ],
}
