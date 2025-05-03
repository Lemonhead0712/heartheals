import { clientEnv } from "./environment"

// Safe to use in client components
export function isTestMode() {
  // On the client, use the NEXT_PUBLIC prefixed variables
  if (typeof window !== "undefined") {
    // For client
    return clientEnv.isDevelopment || clientEnv.isTest
  }

  // For server
  return process.env.NODE_ENV !== "production"
}

// Only use in server components or API routes
export function getServerEnvDetails() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnvDetails cannot be called on the client")
  }

  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
  }
}
