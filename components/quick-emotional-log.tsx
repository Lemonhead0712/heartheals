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
import { cn } from "@/lib/utils"

export function QuickEmotionalLog() {
  const [selectedEmoji, setSelectedEmoji] = useState("peace")
  const [emotion, setEmotion] = useState("")
  const [notes, setNotes] = useState("")
  const [intensity, setIntensity] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addEntry } = useEmotionLogs()
  const { toast } = useToast()
  const { haptic, patternHaptic } = useHapticContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emotion.trim()) {
      toast({ title: "Please enter an emotion", description: "Tell us how you are feeling right now", variant: "destructive" })
      patternHaptic("error")
      return
    }
    setIsSubmitting(true)
    const success = addEntry({ emotion, emoji: selectedEmoji, intensity, notes })
    if (success) {
      setEmotion("")
      setSelectedEmoji("peace")
      setNotes("")
      setIntensity(5)
      toast({ title: "Emotion logged", description: "Your emotional state has been recorded" })
      patternHaptic("success")
    } else {
      patternHaptic("error")
    }
    setIsSubmitting(false)
  }

  const handleEmotionSelect = (e: string) => {
    setEmotion(e)
    haptic("light")
  }

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number.parseInt(e.target.value)
    if (Math.abs(intensity - newVal) >= 2) haptic("light")
    setIntensity(newVal)
  }

  const commonEmotions = ["Happy", "Calm", "Sad", "Anxious", "Excited", "Tired", "Frustrated", "Grateful"]

  return (
    <Card className="h-full glass-card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base">Quick Emotional Log</CardTitle>
        <CardDescription>How are you feeling right now?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{"I'm feeling..."}</label>
            <div className="flex flex-wrap gap-1.5">
              {commonEmotions.map((e) => (
                <HapticButton
                  key={e}
                  type="button"
                  variant={emotion === e ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full text-xs h-7 px-3",
                    emotion === e
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                  onClick={() => handleEmotionSelect(e)}
                  hapticIntensity="light"
                >
                  {e}
                </HapticButton>
              ))}
            </div>
            <input
              type="text"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="Or type your own..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex justify-between">
              <span>Intensity</span>
              <span className="text-foreground">{intensity}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={handleIntensityChange}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any thoughts or reflections..."
              className="min-h-[72px] text-sm border-border bg-background resize-none"
            />
          </div>

          <div className="flex justify-between pt-1">
            <HapticButton
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!emotion.trim() || isSubmitting}
              hapticPattern="success"
            >
              {isSubmitting ? "Saving..." : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save Entry
                </>
              )}
            </HapticButton>
            <HapticButton asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80" hapticIntensity="light">
              <Link href="/emotional-log">
                View All
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </HapticButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
