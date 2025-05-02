/**
 * Utility functions for error handling
 */

// Format error message for display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && error !== null) {
    // Try to extract message from error object
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message
    }

    // Try to stringify the error
    try {
      return JSON.stringify(error)
    } catch (e) {
      return "An unknown error occurred"
    }
  }

  return "An unknown error occurred"
}

// Log error with consistent format
export function logError(context: string, error: unknown): void {
  const timestamp = new Date().toISOString()
  const errorMessage = formatErrorMessage(error)

  console.error(`[${timestamp}] Error in ${context}: ${errorMessage}`)

  // If error has stack trace, log it
  if (error instanceof Error && error.stack) {
    console.error(`Stack trace: ${error.stack}`)
  }
}

// Parse API error response
export async function parseApiError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return data.error || data.message || `API error: ${response.status} ${response.statusText}`
    }

    return `API error: ${response.status} ${response.statusText}`
  } catch (error) {
    return `API error: ${response.status} ${response.statusText}`
  }
}

/**
 * Safely interact with localStorage to prevent errors
 */
export function safeLocalStorage(key: string, action: "get" | "set" | "remove", value?: any): any {
  try {
    if (typeof window === "undefined") {
      return action === "get" ? null : false
    }

    if (action === "get") {
      return localStorage.getItem(key)
    } else if (action === "set" && value !== undefined) {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value))
      return true
    } else if (action === "remove") {
      localStorage.removeItem(key)
      return true
    }
  } catch (error) {
    logError(`localStorage.${action}`, error)
    return action === "get" ? null : false
  }
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    logError("JSON.parse", error)
    return fallback
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): { message: string; details?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    }
  } else if (typeof error === "string") {
    return { message: error }
  } else {
    return { message: "An unknown error occurred" }
  }
}
