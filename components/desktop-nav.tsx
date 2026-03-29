"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookHeart, Clipboard, Home, Wind, Sparkles, Activity } from "lucide-react"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/contexts/subscription-context"
import { useHapticContext } from "@/contexts/haptic-context"

export function DesktopNav() {
  const pathname = usePathname()
  const { tier, isActive } = useSubscription()
  const [scrolled, setScrolled] = useState(false)
  const { haptic, settings } = useHapticContext()

  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavItemClick = () => {
    if (settings.enabled) {
      haptic("light")
    }
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Emotional Log",
      href: "/emotional-log",
      icon: Clipboard,
    },
    {
      name: "Breathe",
      href: "/breathe",
      icon: Wind,
    },
    {
      name: "Thoughts",
      href: "/thoughts",
      icon: BookHeart,
    },
    {
      name: "App Status",
      href: "/app-status",
      icon: Activity,
    },
    {
      name: "Premium",
      href: "/subscription",
      icon: Sparkles,
    },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block",
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent",
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="small" showText={true} />
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavItemClick}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "text-purple-700 bg-purple-50"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under the fixed header */}
      <div className="h-16" />
    </>
  )
}
