"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useHapticContext } from "@/contexts/haptic-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { HapticIntensity, HapticPattern } from "@/hooks/use-haptic"

export function HapticUsageExample() {
  const { haptic, patternHaptic, isHapticSupported } = useHapticContext()
  const [selectedIntensity, setSelectedIntensity] = useState<HapticIntensity>("medium")
  const [selectedPattern, setSelectedPattern] = useState<HapticPattern>("success")

  if (!isHapticSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Haptic Examples</CardTitle>
          <CardDescription>Examples of haptic feedback usage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Haptic feedback is not supported on this device. Please try on a mobile device with vibration support.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haptic Examples</CardTitle>
        <CardDescription>Examples of haptic feedback usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Simple Haptic Feedback</h3>
          <p className="text-sm text-muted-foreground">
            Use simple haptic feedback for button presses and interactions.
          </p>

          <div className="space-y-3">
            <Label>Intensity</Label>
            <RadioGroup
              value={selectedIntensity}
              onValueChange={(value) => setSelectedIntensity(value as HapticIntensity)}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light-example" />
                <Label htmlFor="light-example">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium-example" />
                <Label htmlFor="medium-example">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strong" id="strong-example" />
                <Label htmlFor="strong-example">Strong</Label>
              </div>
            </RadioGroup>

            <Button onClick={() => haptic(selectedIntensity)} className="w-full">
              Test {selectedIntensity} haptic
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pattern Haptic Feedback</h3>
          <p className="text-sm text-muted-foreground">
            Use pattern haptic feedback for notifications and status changes.
          </p>

          <div className="space-y-3">
            <Label>Pattern</Label>
            <RadioGroup
              value={selectedPattern}
              onValueChange={(value) => setSelectedPattern(value as HapticPattern)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single-example" />
                <Label htmlFor="single-example">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="double" id="double-example" />
                <Label htmlFor="double-example">Double</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="success" id="success-example" />
                <Label htmlFor="success-example">Success</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="error" id="error-example" />
                <Label htmlFor="error-example">Error</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warning" id="warning-example" />
                <Label htmlFor="warning-example">Warning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notification" id="notification-example" />
                <Label htmlFor="notification-example">Notification</Label>
              </div>
            </RadioGroup>

            <Button onClick={() => patternHaptic(selectedPattern)} className="w-full">
              Test {selectedPattern} pattern
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Note: Haptic feedback may feel different on various devices. Always test on target devices.
      </CardFooter>
    </Card>
  )
}
