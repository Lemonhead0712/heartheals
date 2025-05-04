import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth-utils"

export async function authMiddleware(request: NextRequest) {
  try {
    // Verify the user's session
    const session = await verifySession(request)

    if (!session || !session.user) {
      // If no valid session, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Continue with the request if authenticated
    return NextResponse.next()
  } catch (error) {
    console.error("Authentication middleware error:", error)

    // Redirect to login on error
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }
}
