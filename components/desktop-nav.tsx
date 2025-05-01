"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookHeart, Clipboard, Home, Wind, Sparkles, Activity } from "lucide-react"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/contexts/subscription-context"
import { useHapticContext } from "@/contexts/haptic-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export function DesktopNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { tier, isActive } = useSubscription()
  const [scrolled, setScrolled] = useState(false)
  const { haptic, settings } = useHapticContext()
  const isMobile = useMobile()

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

  // Only render on desktop
  if (isMobile) return null

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white/80 backdrop-blur-sm",
        )}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="small" showText={true} />
          </Link>

          <div className="flex items-center space-x-6">
            {/* Navigation items */}
            <nav className="flex items-center space-x-1">
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

            {/* Auth button */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-purple-700">Hello, {user.name || user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under the fixed header */}
      <div className="h-16 md:block hidden" />
    </>
  )
}
