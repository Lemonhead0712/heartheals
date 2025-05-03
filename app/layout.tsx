import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProviderFixed as ThemeProvider } from "@/components/theme-provider-fixed"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { Toaster } from "@/components/ui/toaster"
import { HapticProvider } from "@/contexts/haptic-context"
import { AuthProvider } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layouts/main-layout"
import { PageTransitionEffect } from "@/components/page-transition-effect"
import { PremiumFeaturesBanner } from "@/components/premium-features-banner"

// Elegant serif font for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
})

// Clean, modern sans-serif for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "HeartHeals♥",
  description: "Your emotional wellness companion",
  // Add Content Security Policy
  other: {
    "Content-Security-Policy": `
      default-src 'self';
      script-src 'self' https://js.stripe.com 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://*.stripe.com;
      font-src 'self';
      connect-src 'self' https://api.stripe.com;
      frame-src https://js.stripe.com https://hooks.stripe.com;
      object-src 'none';
    `
      .replace(/\s+/g, " ")
      .trim(),
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This runs on the server, so we can safely set a client-accessible environment variable
  // Add this near the top of your RootLayout component
  if (typeof window === "undefined") {
    // Only do this server-side to avoid hydration issues
    const appEnv = process.env.NODE_ENV || "development"
    // Use NEXT_PUBLIC so it's accessible on the client
    process.env.NEXT_PUBLIC_APP_ENV = appEnv
  }

  // Rest of your layout code...

  return (
    <html lang="en" className={`h-full ${playfair.variable} ${inter.variable}`}>
      <body className={`${inter.className} flex min-h-full flex-col bg-background antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SubscriptionProvider>
            <AuthProvider>
              <HapticProvider>
                <MainLayout>
                  {children}
                  <PremiumFeaturesBanner />
                </MainLayout>
                <PageTransitionEffect />
                <Toaster />
              </HapticProvider>
            </AuthProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
