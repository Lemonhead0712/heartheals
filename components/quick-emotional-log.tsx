"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPicker } from "@/components/emoji-picker"
import { useEmotionLogs } from "@/hooks/use-emotion-logs"
import { ArrowRight, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useHapticContext } from "@/contexts/haptic-context"
import { HapticButton } from "@/components/ui/haptic-button"
import { Button } from "@/components/ui/button"

// Fallback haptic functions when context is not available
const fallbackHaptic = {
  haptic: () => {},
  patternHaptic: () => {},
}

export function QuickEmotionalLog() {
  const [selectedEmoji, setSelectedEmoji] = useState("😊")
  const [emotion, setEmotion] = useState("")
  const [notes, setNotes] = useState("")
  const [intensity, setIntensity] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hapticAvailable, setHapticAvailable] = useState(true)

  const { addEntry } = useEmotionLogs()
  const { toast } = useToast()

  // Try to use the haptic context, but provide fallbacks if it fails
  let hapticContext
  try {
    hapticContext = useHapticContext()
    if (!hapticAvailable) setHapticAvailable(true)
  } catch (error) {
    console.error("Haptic context not available:", error)
    hapticContext = fallbackHaptic
    setHapticAvailable(false)
  }

  const { haptic, patternHaptic } = hapticContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emotion.trim()) {
      toast({
        title: "Please enter an emotion",
        description: "Tell us how you're feeling right now",
        variant: "destructive",
      })
      if (hapticAvailable) patternHaptic("error")
      return
    }

    setIsSubmitting(true)

    const success = addEntry({
      emotion,
      emoji: selectedEmoji,
      intensity,
      notes,
    })

    if (success) {
      // Reset form
      setEmotion("")
      setSelectedEmoji("😊")
      setNotes("")
      setIntensity(5)

      toast({
        title: "Emotion logged",
        description: "Your emotional state has been recorded",
      })

      if (hapticAvailable) patternHaptic("success")
    } else {
      if (hapticAvailable) patternHaptic("error")
    }

    setIsSubmitting(false)
  }

  const handleEmotionSelect = (e: string) => {
    setEmotion(e)
    if (hapticAvailable) haptic("light")
  }

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntensity(Number.parseInt(e.target.value))
    // Only trigger haptic on significant changes to avoid too much vibration
    if (hapticAvailable && Math.abs(intensity - Number.parseInt(e.target.value)) >= 2) {
      haptic("light")
    }
  }

  // Common emotions for quick selection
  const commonEmotions = ["Happy", "Calm", "Sad", "Anxious", "Excited", "Tired", "Frustrated", "Grateful"]

  // Use regular Button if haptic is not available
  const ActionButton = hapticAvailable ? HapticButton : Button

  return (
    <Card className="h-full border-pink-200 bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="sm:pb-2">
        <CardTitle className="text-pink-700 sm:text-lg">Emotional State Log</CardTitle>
        <CardDescription className="text-pink-600 sm:text-xs">How are you feeling right now?</CardDescription>
      </CardHeader>
      <CardContent className="sm:pt-1 sm:px-3">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-2">
          <div className="flex flex-col items-center mb-2 -mt-1 sm:-mt-0">
            <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
          </div>

          <div className="space-y-1.5 sm:space-y-1">
            <label className="text-sm font-medium text-pink-700 sm:text-xs">I'm feeling...</label>
            <div className="flex flex-wrap gap-1.5 mb-2 sm:gap-1 sm:mb-1">
              {commonEmotions.map((e) => (
                <ActionButton
                  key={e}
                  type="button"
                  variant={emotion === e ? "default" : "outline"}
                  className={`rounded-full sm:text-xs sm:py-1 sm:px-2 ${
                    emotion === e
                      ? "bg-pink-500 hover:bg-pink-600 text-white"
                      : "border-pink-200 text-pink-700 hover:bg-pink-100"
                  }`}
                  onClick={() => handleEmotionSelect(e)}
                  hapticIntensity={hapticAvailable ? "light" : undefined}
                >
                  {e}
                </ActionButton>
              ))}
            </div>
            <input
              type="text"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="Enter your emotion..."
              className="w-full px-3 py-2 sm:py-1.5 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-1">
            <label className="text-sm font-medium text-pink-700 flex justify-between sm:text-xs">
              <span>Intensity: {intensity}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={handleIntensityChange}
              className="w-full accent-pink-500 sm:h-4"
            />
            <div className="flex justify-between text-xs text-pink-600 sm:text-[10px]">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-1">
            <label className="text-sm font-medium text-pink-700 sm:text-xs">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any thoughts or reflections..."
              className="min-h-[70px] sm:min-h-[60px] border-pink-200 focus-visible:ring-pink-500"
            />
          </div>

          <div className="flex justify-between pt-1 sm:pt-0.5 sm:mt-1">
            <ActionButton
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 sm:text-xs sm:py-1.5"
              disabled={!emotion.trim() || isSubmitting}
              hapticPattern={hapticAvailable ? "success" : undefined}
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 sm:h-3 sm:w-3" />
                  Save Entry
                </>
              )}
            </ActionButton>

            <ActionButton
              asChild
              variant="outline"
              className="border-pink-200 text-pink-700 hover:bg-pink-50 sm:text-xs sm:py-1.5"
              hapticIntensity={hapticAvailable ? "light" : undefined}
            >
              <Link href="/emotional-log">
                View All Entries
                <ArrowRight className="ml-2 h-4 w-4 sm:h-3 sm:w-3" />
              </Link>
            </ActionButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
