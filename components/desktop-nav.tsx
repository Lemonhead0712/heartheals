"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookHeart, Clipboard, Home, Wind, Activity, User } from "lucide-react"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"
import { useHapticContext } from "@/contexts/haptic-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { PageContainer } from "./page-container"

interface DesktopNavProps {
  scrolled?: boolean
}

export function DesktopNav({ scrolled = false }: DesktopNavProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
  ]

  // Only render on desktop
  if (isMobile) return null

  return (
    <PageContainer fullWidth withAuth={false} className="py-2" withGutter={false} maxWidth="3xl">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size="small" showText={true} linkWrapped={true} />
        </Link>

        <div className="flex items-center space-x-4">
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
                    "flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
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
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-sm text-purple-700 hover:text-purple-800 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{user.name || user.email}</span>
              </Link>
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
    </PageContainer>
  )
}
