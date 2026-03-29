"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookHeart, Wind, BarChart3, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticContext } from "@/contexts/haptic-context"
import { Logo } from "./logo"

export function BottomNav() {
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (settings.enabled) {
      haptic("medium")
    }
    if (pathname === href) {
      e.preventDefault()
    }
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Thoughts", href: "/thoughts", icon: BookHeart },
    { name: "Breathe", href: "/breathe", icon: Wind },
    { name: "Log", href: "/emotional-log", icon: BarChart3 },
    { name: "Premium", href: "/subscription", icon: Sparkles },
  ]

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 z-50 w-full bg-card/90 backdrop-blur-xl border-b border-border/50 md:hidden">
        <div className="flex justify-center py-2.5 px-4">
          <Link href="/" onClick={(e) => handleNavClick("/", e)}>
            <Logo size="small" showText={true} />
          </Link>
        </div>
      </div>

      {/* Mobile top spacer */}
      <div className="h-14 md:hidden" />

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
        <div className="bg-card/90 backdrop-blur-xl border-t border-border/50">
          <div className="grid h-16 grid-cols-5 max-w-lg mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors touch-manipulation",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive && "scale-110",
                      )}
                    />
                    {isActive && (
                      <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="mt-1">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
