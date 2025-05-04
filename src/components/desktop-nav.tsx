"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  )
}

interface DesktopNavProps {
  scrolled: boolean
}

export function DesktopNav({ scrolled }: DesktopNavProps) {
  return (
    <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
      <div className="flex items-center">
        <Logo className="mr-6" />
        <nav className="hidden md:flex">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/breathe">Breathe</NavLink>
          <NavLink href="/emotional-log">Emotions</NavLink>
          <NavLink href="/thoughts">Thoughts</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
        </nav>
      </div>
      <div className="hidden md:flex">
        <NavLink href="/login" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
          Sign In
        </NavLink>
      </div>
    </div>
  )
}
