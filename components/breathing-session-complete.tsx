"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

interface BreathingSessionCompleteProps {
  isOpen: boolean
  onClose: () => void
  sessionType: string
  durationSeconds: number
  cyclesCompleted: number
}

export function BreathingSessionComplete({
  isOpen,
  onClose,
  sessionType,
  durationSeconds,
  cyclesCompleted,
}: BreathingSessionCompleteProps) {
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate saving to database
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real implementation, we would save to the database here
    console.log("Saving session:", {
      sessionType,
      durationSeconds,
      cyclesCompleted,
      notes,
    })

    setIsSaving(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">Session Complete!</DialogTitle>
          <DialogDescription className="text-center">Great job completing your breathing exercise</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Duration</span>
            <span className="text-lg font-bold text-blue-700">{formatTime(durationSeconds)}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Cycles</span>
            <span className="text-lg font-bold text-blue-700">{cyclesCompleted}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Session Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="How did this session make you feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
