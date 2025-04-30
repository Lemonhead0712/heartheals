"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useHaptic } from "@/hooks/use-haptic"
import { clearLocalStorage, type ResetDataType, type ResetProgress } from "@/utils/reset-utils"

interface SelectiveResetDialogProps {
  onComplete?: () => void
}

export function SelectiveResetDialog({ onComplete }: SelectiveResetDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [resetProgress, setResetProgress] = useState<ResetProgress>({
    step: "",
    progress: 0,
    isComplete: false,
  })
  const [resetError, setResetError] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<ResetDataType[]>([])
  const { haptic, patternHaptic } = useHaptic()

  const resetOptions: { id: ResetDataType; label: string; description: string }[] = [
    {
      id: "emotions",
      label: "Emotion Logs",
      description: "Clear all saved emotion logs and related data",
    },
    {
      id: "thoughts",
      label: "Thought Records",
      description: "Clear all saved thought records and patterns",
    },
    {
      id: "breathing",
      label: "Breathing Sessions",
      description: "Clear all breathing session history and settings",
    },
    {
      id: "settings",
      label: "App Settings",
      description: "Reset all app settings to default values",
    },
  ]

  const handleReset = async () => {
    if (selectedTypes.length === 0) return

    setIsResetting(true)
    setResetError(null)
    haptic("medium")

    try {
      // Process each selected type
      for (let i = 0; i < selectedTypes.length; i++) {
        const type = selectedTypes[i]
        const progress = Math.round((i / selectedTypes.length) * 100)

        setResetProgress({
          step: `Clearing ${resetOptions.find((opt) => opt.id === type)?.label.toLowerCase() || type}...`,
          progress,
          isComplete: false,
        })

        // Clear data for this type
        await clearLocalStorage(type)

        // Provide haptic feedback
        haptic("light")
      }

      // Complete
      setResetProgress({
        step: "Reset complete",
        progress: 100,
        isComplete: true,
      })

      patternHaptic("success")
      setIsComplete(true)

      // Close dialog after showing success message
      setTimeout(() => {
        setIsOpen(false)

        // Reset state after dialog closes
        setTimeout(() => {
          setIsResetting(false)
          setIsComplete(false)
          setSelectedTypes([])

          // Call onComplete callback
          onComplete?.()
        }, 300)
      }, 2000)
    } catch (error) {
      console.error("Error during selective reset:", error)
      setResetError("An unexpected error occurred. Please try again.")
      setIsResetting(false)
      patternHaptic("error")
    }
  }

  const toggleType = (type: ResetDataType) => {
    haptic("light")
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => {
            haptic("light")
            setSelectedTypes([])
            setResetProgress({
              step: "",
              progress: 0,
              isComplete: false,
            })
          }}
        >
          Selective Reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">Selective Data Reset</DialogTitle>
          <DialogDescription>Choose which data you want to reset</DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <>
            <div className="py-4">
              {!isResetting ? (
                <div className="space-y-4">
                  {resetOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50">
                      <Checkbox
                        id={`reset-${option.id}`}
                        checked={selectedTypes.includes(option.id)}
                        onCheckedChange={() => toggleType(option.id)}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor={`reset-${option.id}`} className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{resetProgress.step}</span>
                    <span>{resetProgress.progress}%</span>
                  </div>
                  <Progress value={resetProgress.progress} className="h-2" />
                </div>
              )}

              {resetError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  <p className="font-medium">Error during reset:</p>
                  <p>{resetError}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isResetting}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleReset}
                disabled={isResetting || selectedTypes.length === 0}
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Selected Data"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Reset Complete</h3>
            <p className="mt-2 text-sm text-gray-500">Selected data has been reset successfully.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
