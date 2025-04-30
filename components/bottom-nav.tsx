"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookHeart, Wind, BarChart3, CreditCard, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticContext } from "@/contexts/haptic-context"
import { Logo } from "./logo"
import StatusIconTooltip from "./status-icon-tooltip"

export function BottomNav() {
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    // Only trigger haptic feedback if enabled
    if (settings.enabled) {
      haptic("medium")
    }

    // If it's the current page, prevent default navigation
    if (pathname === href) {
      e.preventDefault()
    }
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Thoughts",
      href: "/thoughts",
      icon: BookHeart,
    },
    {
      name: "Breathe",
      href: "/breathe",
      icon: Wind,
    },
    {
      name: "Log",
      href: "/emotional-log",
      icon: BarChart3,
    },
    {
      name: "Status",
      href: "/app-status",
      icon: Activity,
    },
    {
      name: "Subscribe",
      href: "/subscription",
      icon: CreditCard,
    },
  ]

  return (
    <>
      {/* Mobile Logo Bar - Only visible on mobile */}
      <div className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm md:hidden">
        <div className="flex justify-center py-2">
          <Link href="/" onClick={(e) => handleNavClick("/", e)}>
            <Logo size="small" showText={true} className="py-1" />
          </Link>
        </div>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden overflow-x-auto scrollbar-hide">
        <div className="grid h-full grid-cols-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
                  "active:bg-gray-100 touch-manipulation", // Add active state and touch optimization
                  item.name === "Status" && !isActive && "text-purple-500/70", // Special styling for status icon
                )}
              >
                {item.name === "Status" ? (
                  <StatusIconTooltip
                    size="sm"
                    isActive={isActive}
                    tooltipText="App Status"
                    className={isActive ? "text-primary" : undefined}
                  />
                ) : (
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      isActive ? "text-primary" : "text-muted-foreground",
                      isActive && "scale-110", // Slightly enlarge active icon
                    )}
                  />
                )}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
