import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return <Loader2 className={cn(`animate-spin text-purple-600 ${sizeClasses[size]}`, className)} />
}
