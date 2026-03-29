import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="hidden md:block w-full border-t border-border/50 bg-card/50 backdrop-blur-sm relative z-10">
      <div
        className="max-w-5xl mx-auto flex flex-col items-center gap-6 px-6 py-8 md:flex-row md:justify-between"
        style={{
          paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Brand + tagline */}
        <div className="flex flex-col items-center md:items-start gap-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Heart className="h-4 w-4 text-primary fill-primary/30" />
            <span className="font-serif">HeartsHeal</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left max-w-xs">
            A safe space for emotional healing, reflection, and personal growth.
          </p>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center gap-6">
          {[
            { label: "About", href: "/about" },
            { label: "FAQ", href: "/faq" },
            { label: "Premium", href: "/subscription" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} HeartsHeal
        </p>
      </div>
    </footer>
  )
}
