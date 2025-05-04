"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Wind, Heart, Brain, User } from "lucide-react"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
}

function NavItem({ href, icon, label }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center py-2",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
      <span className="mt-1 text-xs">{label}</span>
    </Link>
  )
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t bg-background md:hidden">
      <NavItem href="/" icon={<Home className="h-5 w-5" />} label="Home" />
      <NavItem href="/breathe" icon={<Wind className="h-5 w-5" />} label="Breathe" />
      <NavItem href="/emotional-log" icon={<Heart className="h-5 w-5" />} label="Emotions" />
      <NavItem href="/thoughts" icon={<Brain className="h-5 w-5" />} label="Thoughts" />
      <NavItem href="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
    </nav>
  )
}
