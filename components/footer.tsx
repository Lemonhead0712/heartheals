"use client"

import Link from "next/link"
import { Heart, Info, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useHapticContext } from "@/contexts/haptic-context"

export function Footer() {
  const pathname = usePathname()
  const { haptic, settings } = useHapticContext()

  const handleLinkClick = () => {
    if (settings.enabled) {
      haptic("light")
    }
  }

  return (
    <footer className="w-full border-t bg-background py-4 md:py-6 relative z-10">
      <div
        className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 md:flex-row md:justify-between md:gap-4"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
          <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-rose-500" />
          <span>© {new Date().getFullYear()} HeartsHeal♥</span>
        </div>

        <nav className="flex gap-4 md:gap-6">
          <Link
            href="/about"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground py-2 px-1",
              pathname === "/about" && "text-purple-700 font-medium",
            )}
            style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
          >
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4 hidden md:inline" />
            <span>About Us</span>
          </Link>
          <Link
            href="/faq"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground py-2 px-1",
              pathname === "/faq" && "text-purple-700 font-medium",
            )}
            style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
          >
            <HelpCircle className="h-3.5 w-3.5 md:h-4 md:w-4 hidden md:inline" />
            <span>FAQ</span>
          </Link>
        </nav>
      </div>
    </footer>
  )
}
