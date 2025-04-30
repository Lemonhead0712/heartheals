import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProviderFixed as ThemeProvider } from "@/components/theme-provider-fixed"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { HapticProvider } from "@/contexts/haptic-context"
import { DesktopNav } from "@/components/desktop-nav"
import { Footer } from "@/components/footer"
import { SubscriptionTestPanel } from "@/components/subscription-test-panel"
import { SwipeNavigationTutorial } from "@/components/swipe-navigation-tutorial"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWASetup } from "./pwa"
import { AppInstallPrompt } from "@/components/app-install-prompt"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
}

export const metadata: Metadata = {
  title: "HeartsHeal♥",
  description: "A safe space for emotional healing, reflection, and growth",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HeartsHeal♥",
  },
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="application-name" content="HeartsHeal♥" />
        <meta name="apple-mobile-web-app-title" content="HeartsHeal♥" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${inter.className} flex min-h-full flex-col overscroll-none`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SubscriptionProvider>
            <HapticProvider>
              <PWASetup />
              <div className="flex flex-1 flex-col">
                <DesktopNav />
                {children}
                <Footer />
              </div>
              <BottomNav />
              <SubscriptionTestPanel />
              <SwipeNavigationTutorial />
              <OfflineIndicator />
              <AppInstallPrompt />
              <Toaster />
            </HapticProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
