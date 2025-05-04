"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookHeart, Wind, BarChart3, Activity, User, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticContext } from "@/contexts/haptic-context"
import { Logo } from "./logo"
import StatusIconTooltip from "./status-icon-tooltip"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect, useCallback } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function BottomNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    // Only trigger haptic feedback if enabled
    if (settings.enabled) {
      haptic("medium")
    }

    // If it's the current page, prevent default navigation
    if (pathname === href) {
      e.preventDefault()
    }

    // Close the menu if it's open
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false)
      }
    },
    [isMenuOpen],
  )

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      // Check if the click is outside the menu and not on the menu button
      if (
        isMenuOpen &&
        e.target instanceof Node &&
        !document.querySelector('[role="dialog"]')?.contains(e.target) &&
        !document.querySelector('[aria-label="Toggle menu"]')?.contains(e.target)
      ) {
        setIsMenuOpen(false)
      }
    },
    [isMenuOpen],
  )

  useEffect(() => {
    // Only add event listeners if we're on mobile
    if (isMobile) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
    // Clean-up function still needed even if condition not met
    return () => {}
  }, [handleEscape, handleClickOutside, isMobile])

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
  ]

  // Return null for non-mobile, but after all hooks are defined
  if (!isMobile) return null

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <Link href="/" onClick={(e) => handleNavClick("/", e)} className="flex items-center">
            <Logo size="small" showText={true} linkWrapped={true} />
          </Link>

          <div className="flex items-center space-x-2">
            {user ? (
              <Button variant="ghost" size="sm" className="text-purple-700" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5 mr-1" />
                  <span className="sr-only md:not-sr-only">Profile</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="text-purple-700" asChild>
                <Link href="/login">
                  <User className="h-5 w-5 mr-1" />
                  <span className="sr-only md:not-sr-only">Sign In</span>
                </Link>
              </Button>
            )}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-purple-700"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-center">
                    <Logo size="small" showText={true} />
                  </SheetTitle>
                </SheetHeader>
                <div className="py-6 flex flex-col space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleNavClick(item.href, e)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors",
                          isActive
                            ? "text-purple-700 bg-purple-50"
                            : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50",
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}

                  {user && (
                    <Button
                      variant="outline"
                      className="mt-6 border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under the fixed header */}
      <div className="h-14" />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t shadow-sm">
        <div className="grid h-full grid-cols-5 max-w-md mx-auto">
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
