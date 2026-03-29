"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookHeart, Clipboard, Home, Wind, Sparkles } from "lucide-react"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"
import { useHapticContext } from "@/contexts/haptic-context"

export function DesktopNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { haptic, settings } = useHapticContext()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavItemClick = () => {
    if (settings.enabled) {
      haptic("light")
    }
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Emotional Log", href: "/emotional-log", icon: Clipboard },
    { name: "Breathe", href: "/breathe", icon: Wind },
    { name: "Thoughts", href: "/thoughts", icon: BookHeart },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:block transition-all duration-300",
          scrolled
            ? "bg-card/85 backdrop-blur-xl shadow-sm border-b border-border/50"
            : "bg-transparent",
        )}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={handleNavItemClick}>
            <Logo size="small" showText={true} />
          </Link>

          {/* Center nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isCurrentPage = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavItemClick}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isCurrentPage
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isCurrentPage && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Premium CTA */}
          <Link
            href="/subscription"
            onClick={handleNavItemClick}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              pathname === "/subscription"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Premium</span>
          </Link>
        </div>
      </header>

      {/* Spacer for fixed header -- only on desktop */}
      <div className="hidden md:block h-16" />
    </>
  )
}
