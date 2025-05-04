"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DesktopNav } from "@/components/desktop-nav"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { SwipeNavigation } from "@/components/swipe-navigation"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Special pages that need full-width layout
  const isFullWidthPage = ["/breathe", "/emotional-log"].includes(pathname)

  // Pages that should not use swipe navigation
  const noSwipePages = ["/login", "/create-account", "/profile", "/subscription", "/terms", "/faq", "/about"]

  const useSwipeNavigation = !noSwipePages.some((page) => pathname.startsWith(page))

  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Main content with proper layout
  const mainContent = (
    <main className={cn("flex-1 pt-16 pb-16 md:pb-0", isFullWidthPage ? "" : "px-2 sm:px-3 md:px-4")}>{children}</main>
  )

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
          scrolled ? "border-border/40 bg-background/80 backdrop-blur-lg" : "border-transparent",
        )}
      >
        <DesktopNav scrolled={scrolled} />
      </div>

      <BottomNav />

      {useSwipeNavigation ? <SwipeNavigation>{mainContent}</SwipeNavigation> : mainContent}

      <Footer />
    </div>
  )
}
