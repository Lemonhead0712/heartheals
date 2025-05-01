import { cn } from "@/lib/utils"
import type React from "react"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function DisplayLarge({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-6xl md:text-7xl font-playfair font-bold tracking-tighter leading-tighter text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function DisplayMedium({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-5xl md:text-6xl font-playfair font-bold tracking-tighter leading-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function DisplaySmall({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-4xl md:text-5xl font-playfair font-bold tracking-tight leading-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function Heading1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-3xl md:text-4xl font-playfair font-bold tracking-tight leading-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function Heading2({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-2xl md:text-3xl font-playfair font-semibold tracking-tight leading-tight text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function Heading3({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        "text-xl md:text-2xl font-playfair font-semibold tracking-tight leading-tight text-foreground",
        className,
      )}
    >
      {children}
    </h3>
  )
}

export function Heading4({ children, className }: TypographyProps) {
  return (
    <h4
      className={cn(
        "text-lg md:text-xl font-playfair font-semibold tracking-tight leading-snug text-foreground",
        className,
      )}
    >
      {children}
    </h4>
  )
}

export function Heading5({ children, className }: TypographyProps) {
  return (
    <h5 className={cn("text-base md:text-lg font-playfair font-semibold leading-snug text-foreground", className)}>
      {children}
    </h5>
  )
}

export function Heading6({ children, className }: TypographyProps) {
  return (
    <h6 className={cn("text-base font-playfair font-semibold leading-snug text-foreground", className)}>{children}</h6>
  )
}

export function Paragraph({ children, className }: TypographyProps) {
  return <p className={cn("text-base font-inter leading-relaxed text-foreground", className)}>{children}</p>
}

export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xl font-inter font-light leading-relaxed text-muted-foreground", className)}>{children}</p>
  )
}

export function Large({ children, className }: TypographyProps) {
  return (
    <div className={cn("text-lg font-inter font-medium leading-normal text-foreground", className)}>{children}</div>
  )
}

export function Small({ children, className }: TypographyProps) {
  return <small className={cn("text-sm font-inter leading-normal text-foreground", className)}>{children}</small>
}

export function Muted({ children, className }: TypographyProps) {
  return <p className={cn("text-sm font-inter leading-normal text-muted-foreground", className)}>{children}</p>
}

export function Quote({ children, className }: TypographyProps) {
  return (
    <blockquote
      className={cn(
        "pl-4 border-l-2 border-primary italic text-lg font-playfair leading-relaxed text-foreground",
        className,
      )}
    >
      {children}
    </blockquote>
  )
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)}>
      {children}
    </code>
  )
}

export function List({ children, className }: TypographyProps) {
  return <ul className={cn("my-6 ml-6 list-disc font-inter [&>li]:mt-2", className)}>{children}</ul>
}

export function InlineLink({ href, children, className }: TypographyProps & { href: string }) {
  return (
    <a
      href={href}
      className={cn(
        "font-inter font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
        className,
      )}
    >
      {children}
    </a>
  )
}
