// Environment variables safely exposed to the client
// This file should be imported by client components that need environment info

export const clientEnv = {
  isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === "development",
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === "production",
  isTest: process.env.NEXT_PUBLIC_APP_ENV === "test",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
}

// Server-only environment variables - only import this in server components or API routes
export const serverEnv = {
  nodeEnv: process.env.NODE_ENV,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
}
