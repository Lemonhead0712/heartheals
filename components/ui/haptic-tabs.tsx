"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useHapticContext } from "@/contexts/haptic-context"
import type { HapticIntensity } from "@/hooks/use-haptic"

interface HapticTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsTrigger> {
  hapticIntensity?: HapticIntensity
}

export function HapticTabsTrigger({ hapticIntensity = "light", onClick, ...props }: HapticTabsTriggerProps) {
  const { haptic } = useHapticContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptic(hapticIntensity)

    if (onClick) {
      onClick(e)
    }
  }

  return <TabsTrigger onClick={handleClick} {...props} />
}

// Re-export the other components from the original Tabs
export { Tabs, TabsList, TabsContent }
