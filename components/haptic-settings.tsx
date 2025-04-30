"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { HapticSwitch } from "@/components/ui/haptic-switch"
import { useHapticContext } from "@/contexts/haptic-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import type { HapticIntensity } from "@/hooks/use-haptic"

export function HapticSettings() {
  const { settings, updateSettings, isHapticSupported, haptic, patternHaptic } = useHapticContext()

  const handleIntensityChange = (value: string) => {
    updateSettings({ intensity: value as HapticIntensity })
    // Provide a sample of the selected intensity
    haptic(value as HapticIntensity)
  }

  if (!isHapticSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Haptic Feedback</CardTitle>
          <CardDescription>Tactile feedback for interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Haptic feedback is not supported on this device.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haptic Feedback</CardTitle>
        <CardDescription>Tactile feedback for interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="haptic-toggle" className="flex flex-col space-y-1">
            <span>Enable haptic feedback</span>
            <span className="font-normal text-xs text-muted-foreground">
              Feel subtle vibrations when interacting with elements
            </span>
          </Label>
          <HapticSwitch
            id="haptic-toggle"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="space-y-3">
              <Label>Intensity</Label>
              <RadioGroup
                value={settings.intensity}
                onValueChange={handleIntensityChange}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strong" id="strong" />
                  <Label htmlFor="strong">Strong</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Test Haptic Patterns</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => patternHaptic("single")}>
                  Single
                </Button>
                <Button variant="outline" size="sm" onClick={() => patternHaptic("double")}>
                  Double
                </Button>
                <Button variant="outline" size="sm" onClick={() => patternHaptic("success")}>
                  Success
                </Button>
                <Button variant="outline" size="sm" onClick={() => patternHaptic("error")}>
                  Error
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
