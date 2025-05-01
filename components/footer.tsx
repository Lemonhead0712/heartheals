"use client"

import { useState } from "react"
import Link from "next/link"
import { Logo } from "./logo"
import { PageContainer } from "./page-container"
import { useMobile } from "@/hooks/use-mobile"

export function Footer() {
  const [year] = useState(() => new Date().getFullYear())
  const isMobile = useMobile()

  // Don't show footer on mobile as we have bottom navigation
  if (isMobile) return null

  return (
    <footer className="border-t py-8 mt-12">
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Logo size="small" showText={true} />
            <p className="text-sm text-muted-foreground max-w-xs">
              A sanctuary for emotional healing, reflection, and personal growth.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/emotional-log"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Emotional Log
                </Link>
              </li>
              <li>
                <Link href="/breathe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Breathing Exercises
                </Link>
              </li>
              <li>
                <Link
                  href="/thoughts"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Emotional Thoughts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/app-status"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  App Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">&copy; {year} HeartsHeal. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  )
}
