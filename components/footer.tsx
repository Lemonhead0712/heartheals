import Link from "next/link"
import { Heart } from "lucide-react"

const footerLinks = {
  Explore: [
    { label: "Home",          href: "/" },
    { label: "Breathe",       href: "/breathe" },
    { label: "Thoughts",      href: "/thoughts" },
    { label: "Emotional Log", href: "/emotional-log" },
  ],
  Support: [
    { label: "About",    href: "/about" },
    { label: "FAQ",      href: "/faq" },
    { label: "Premium",  href: "/subscription" },
  ],
}

export function Footer() {
  return (
    <footer className="hidden md:block w-full border-t border-border/50 bg-card/40 backdrop-blur-sm relative z-10">
      <div
        className="max-w-5xl mx-auto px-6 py-10"
        style={{
          paddingLeft:  "max(1.5rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          paddingBottom:"max(2.5rem, env(safe-area-inset-bottom))",
        }}
      >
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16 mb-8">
          {/* Brand */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-primary fill-primary/20 shrink-0" />
              <span className="font-serif text-base font-semibold text-foreground">HeartsHeal</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A calming space for emotional healing, guided breathing, reflective journaling, and personal growth.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 md:gap-16 shrink-0">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">
                  {section}
                </p>
                <ul className="flex flex-col gap-2">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HeartsHeal. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care for those on a healing journey.
          </p>
        </div>
      </div>
    </footer>
  )
}
