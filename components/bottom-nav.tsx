"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookHeart, Wind, BarChart3, CreditCard, Activity, HelpCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticContext } from "@/contexts/haptic-context"
import { Logo } from "./logo"
import StatusIconTooltip from "./status-icon-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

export function BottomNav() {
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()
  const { isMobile, safeAreaInsets } = useMobile()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Handle scroll behavior to hide/show bottom nav
  useEffect(() => {
    if (!isMobile) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide
        setIsVisible(false)
      } else {
        // Scrolling up or at top - show
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobile, lastScrollY])

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

  if (!isMobile) return null

  return (
    <>
      {/* Mobile Logo Bar - Only visible on mobile */}
      <div
        className="fixed top-0 left-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm md:hidden"
        style={{ paddingTop: `${safeAreaInsets.top}px` }}
      >
        <div className="flex justify-between items-center px-4 py-2.5">
          <Link
            href="/about"
            onClick={(e) => handleNavClick("/about", e)}
            className={cn(
              "flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
              pathname === "/about"
                ? "text-purple-700 bg-purple-50"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50",
            )}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </Link>

          <Link href="/" onClick={(e) => handleNavClick("/", e)}>
            <Logo size="small" showText={true} className="py-1" />
          </Link>

          <Link
            href="/faq"
            onClick={(e) => handleNavClick("/faq", e)}
            className={cn(
              "flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
              pathname === "/faq"
                ? "text-purple-700 bg-purple-50"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50",
            )}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed bottom-0 left-0 z-50 w-full bg-white border-t md:hidden overflow-x-auto scrollbar-hide"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
            style={{
              paddingBottom: `${safeAreaInsets.bottom}px`,
              height: `calc(64px + ${safeAreaInsets.bottom}px)`,
            }}
          >
            <div className="grid h-16 grid-cols-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.href, e)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                      isActive ? "text-purple-700" : "text-muted-foreground hover:text-purple-600",
                      "active:bg-gray-100 touch-manipulation", // Add active state and touch optimization
                      item.name === "Status" && !isActive && "text-purple-500/70", // Special styling for status icon
                    )}
                  >
                    {item.name === "Status" ? (
                      <StatusIconTooltip
                        size="sm"
                        isActive={isActive}
                        tooltipText="App Status"
                        className={isActive ? "text-purple-700" : undefined}
                      />
                    ) : (
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-transform",
                          isActive ? "text-purple-700" : "text-muted-foreground",
                          isActive && "scale-110", // Slightly enlarge active icon
                        )}
                      />
                    )}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
