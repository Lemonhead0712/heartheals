"use client"

import type React from "react"

import Link from "next/link"
import type { ReactNode } from "react"

interface LinkWrapperProps {
  href?: string
  className?: string
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  isWrapped?: boolean
}

/**
 * A utility component that conditionally wraps children in a Next.js Link
 * Helps prevent nested <a> tags which cause hydration errors
 */
export function LinkWrapper({ href, className, children, onClick, isWrapped = false }: LinkWrapperProps) {
  // If already wrapped or no href provided, just return children
  if (isWrapped || !href) {
    return <div className={className}>{children}</div>
  }

  // Otherwise wrap in a Link
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
