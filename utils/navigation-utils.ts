import type { ReadonlyURLSearchParams } from "next/navigation"

/**
 * Gets a redirect URL from search params or returns a default
 * @param searchParams The URL search params
 * @param defaultPath The default path to redirect to if none is specified
 * @returns The redirect URL
 */
export function getRedirectUrl(searchParams: ReadonlyURLSearchParams | null, defaultPath = "/"): string {
  if (!searchParams) return defaultPath

  const redirect = searchParams.get("redirect")
  if (!redirect) return defaultPath

  // Validate the redirect URL to prevent open redirect vulnerabilities
  // Only allow relative paths within our app
  if (redirect.startsWith("/") && !redirect.includes("//")) {
    return redirect
  }

  return defaultPath
}

/**
 * Creates a login URL with a redirect parameter
 * @param currentPath The current path to redirect back to after login
 * @returns The login URL with redirect parameter
 */
export function createLoginUrl(currentPath: string): string {
  return `/login?redirect=${encodeURIComponent(currentPath)}`
}
