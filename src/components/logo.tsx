import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      <Image src="/images/heart-heals-logo.png" alt="HeartHeals Logo" width={32} height={32} className="h-8 w-8" />
      <span className="font-playfair text-xl font-bold">HeartHeals♥</span>
    </Link>
  )
}
