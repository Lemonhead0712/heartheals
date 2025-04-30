"use client"
import { Switch, type SwitchProps } from "@/components/ui/switch"
import { useHapticContext } from "@/contexts/haptic-context"
import type { HapticIntensity } from "@/hooks/use-haptic"

interface HapticSwitchProps extends SwitchProps {
  hapticIntensity?: HapticIntensity
}

export function HapticSwitch({ hapticIntensity = "medium", onCheckedChange, ...props }: HapticSwitchProps) {
  const { haptic } = useHapticContext()

  const handleCheckedChange = (checked: boolean) => {
    haptic(hapticIntensity)

    if (onCheckedChange) {
      onCheckedChange(checked)
    }
  }

  return <Switch onCheckedChange={handleCheckedChange} {...props} />
}
