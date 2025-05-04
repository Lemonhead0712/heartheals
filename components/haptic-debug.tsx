"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useHapticContext } from "@/contexts/haptic-context"
import { AlertCircle, CheckCircle } from "lucide-react"

export function HapticDebug() {
  const [isProviderAvailable, setIsProviderAvailable] = useState<boolean | null>(null)
  const [isHapticSupported, setIsHapticSupported] = useState<boolean | null>(null)
  const [hapticContext, setHapticContext] = useState<any>(null)

  useEffect(() => {
    try {
      // Check if we can access the context
      const context = require("@/contexts/haptic-context")
      setIsProviderAvailable(true)
    } catch (error) {
      console.error("Error accessing haptic context:", error)
      setIsProviderAvailable(false)
    }
  }, [])

  useEffect(() => {
    try {
      const context = useHapticContext()
      setHapticContext(context)
      setIsHapticSupported(context.isHapticSupported())
    } catch (error) {
      console.error("Haptic context not available:", error)
      setIsHapticSupported(false)
    }
  }, [])

  const testHaptic = useCallback(() => {
    if (hapticContext) {
      hapticContext.haptic("medium")
      setTimeout(() => {
        hapticContext.patternHaptic("success")
      }, 500)
    }
  }, [hapticContext])

  return (
    <Card className="border-blue-200 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-700 text-lg">Haptic Feedback Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">HapticProvider:</span>
            {isProviderAvailable === null ? (
              <span>Checking...</span>
            ) : isProviderAvailable ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" /> Available
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" /> Not Available
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Haptic Context:</span>
            {hapticContext ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" /> Working
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" /> Not Working
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Device Support:</span>
            {isHapticSupported === null ? (
              <span>Checking...</span>
            ) : isHapticSupported ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" /> Supported
              </span>
            ) : (
              <span className="flex items-center text-yellow-600">
                <AlertCircle className="h-4 w-4 mr-1" /> Not Supported
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Settings:</span>
            {hapticContext ? (
              <span>
                {hapticContext.settings.enabled ? "Enabled" : "Disabled"} ({hapticContext.settings.intensity})
              </span>
            ) : (
              <span>Not Available</span>
            )}
          </div>

          <Button onClick={testHaptic} disabled={!hapticContext || !isHapticSupported} className="w-full mt-2">
            Test Haptic Feedback
          </Button>

          <p className="text-xs text-gray-500 mt-2">
            Note: Haptic feedback requires browser support and user permission. Some browsers only allow vibration after
            user interaction.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
