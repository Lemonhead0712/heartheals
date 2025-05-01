import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProviderFixed as ThemeProvider } from "@/components/theme-provider-fixed"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { HapticProvider } from "@/contexts/haptic-context"
import { DesktopNav } from "@/components/desktop-nav"
import { Footer } from "@/components/footer"
import { SwipeNavigationTutorial } from "@/components/swipe-navigation-tutorial"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HeartsHeal♥",
  description: "A safe space for emotional healing, reflection, and growth",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SubscriptionProvider>
            <HapticProvider>
              <div className="flex flex-1 flex-col">
                <DesktopNav />
                {children}
                <Footer />
              </div>
              <BottomNav />
              <SwipeNavigationTutorial />
              <Toaster />
            </HapticProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
