"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Save, AlertCircle, RefreshCw, Clock, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/logo"
import { BottomNav } from "@/components/bottom-nav"
import { EmojiPicker } from "@/components/emoji-picker"
import { FeatureGate } from "@/components/feature-gate"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageContainer } from "@/components/page-container"
import { EmotionalSurvey } from "@/components/emotional-survey"
import { EnhancedEmotionalAnalytics } from "@/components/enhanced-emotional-analytics"
import { formatRelativeTime } from "@/utils/date-utils"
import { useRealTimeUpdate } from "@/hooks/use-real-time-update"
import { DailyEmotionFolder } from "@/components/daily-emotion-folder"
import { useEmotionLogs } from "@/hooks/use-emotion-logs"

export default function EmotionalLogPage() {
  return (
    <PageContainer>
      <EmotionalLog />
    </PageContainer>
  )
}

function EmotionalLog() {
  const { entries, isLoading, error, addEntry, deleteEntry } = useEmotionLogs()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Update the component every minute to keep relative times current
  const currentTime = useRealTimeUpdate(60000)

  // Ensure we have a valid entries array
  const emotionLogs = entries || []

  const [currentEmotion, setCurrentEmotion] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("😊")
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState("")
  const [showSurvey, setShowSurvey] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const emotions = [
    "Joy",
    "Sadness",
    "Anger",
    "Fear",
    "Surprise",
    "Disgust",
    "Trust",
    "Anticipation",
    "Calm",
    "Anxious",
  ]

  // Group entries by date
  const groupedEntries = emotionLogs.reduce((groups: Record<string, any[]>, entry) => {
    // Get the date part only (without time)
    const date = new Date(entry.timestamp).toISOString().split("T")[0]

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(entry)
    return groups
  }, {})

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    // In a real implementation, this would trigger a data refresh
    // For now, we'll just update the last updated time
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const success = addEntry({
      emotion: currentEmotion,
      emoji: selectedEmoji,
      intensity: intensity,
      notes: notes,
    })

    if (success) {
      setCurrentEmotion("")
      setSelectedEmoji("😊")
      setIntensity(5)
      setNotes("")
      setShowSurvey(true)
      setLastUpdated(new Date())
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id)
      setLastUpdated(new Date())
    }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] pb-20">
      <motion.div
        className="container mx-auto px-4 py-8 max-w-4xl"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="flex flex-col items-center mb-6" variants={item}>
          <Logo size="small" />
        </motion.div>

        <motion.div className="mb-8 flex justify-between items-center" variants={item}>
          <div>
            <Link href="/" className="inline-flex items-center text-pink-700 hover:text-pink-900 transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-pink-800 mt-4 mb-2">Emotional State Log</h1>
            <p className="text-pink-600">Track your emotions and reflect on your emotional patterns</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-pink-500 mr-1" />
              <span className="text-xs text-pink-500">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div className="mb-4" variants={item}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <FeatureGate featureId="emotional-log">
          <motion.div variants={item}>
            <Card className="mb-8 border-pink-200 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-pink-700">How are you feeling?</CardTitle>
                  <CardDescription className="text-pink-600">Log your current emotional state</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="h-8 w-8"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 text-pink-500 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="emotion" className="text-pink-700">
                      Emotion
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {emotions.map((emotion) => (
                        <Button
                          key={emotion}
                          type="button"
                          variant={currentEmotion === emotion ? "default" : "outline"}
                          className={`rounded-full ${
                            currentEmotion === emotion
                              ? "bg-pink-500 hover:bg-pink-600 text-white"
                              : "border-pink-200 text-pink-700 hover:bg-pink-100"
                          }`}
                          onClick={() => setCurrentEmotion(emotion)}
                        >
                          {emotion}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-pink-200 text-pink-700 hover:bg-pink-100"
                        onClick={() => setCurrentEmotion("")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Other
                      </Button>
                    </div>
                    {currentEmotion === "" && (
                      <Input
                        id="custom-emotion"
                        placeholder="Enter your emotion"
                        className="mt-2 border-pink-200 focus-visible:ring-pink-500"
                        value={currentEmotion}
                        onChange={(e) => setCurrentEmotion(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emoji" className="text-pink-700">
                      Choose an emoji that represents how you feel
                    </Label>
                    <div className="mt-2">
                      <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intensity" className="text-pink-700">
                      Intensity: {intensity}
                    </Label>
                    <Input
                      id="intensity"
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number.parseInt(e.target.value))}
                      className="accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-pink-600">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Intense</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-pink-700">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="What triggered this emotion? How does it feel in your body?"
                      className="min-h-[100px] border-pink-200 focus-visible:ring-pink-500"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    disabled={!currentEmotion.trim()}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Entry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Show survey after a successful entry */}
          {showSurvey && emotionLogs && emotionLogs.length > 0 && (
            <motion.div
              variants={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmotionalSurvey onComplete={() => setShowSurvey(false)} />
            </motion.div>
          )}

          <motion.div className="space-y-4" variants={item}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-pink-700 mr-2" />
                <h2 className="text-2xl font-semibold text-pink-800">Your Emotional Journey</h2>
              </div>
              <span className="text-xs text-pink-500">Last updated: {formatRelativeTime(lastUpdated)}</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <AnimatePresence>
                {emotionLogs && emotionLogs.length === 0 ? (
                  <Card className="border-pink-200 bg-white/80 backdrop-blur-sm p-8 text-center text-pink-600">
                    No entries yet. Start tracking your emotions above.
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {sortedDates.map((date) => (
                      <DailyEmotionFolder
                        key={date}
                        date={date}
                        entries={groupedEntries[date]}
                        onDeleteEntry={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </FeatureGate>

        {/* Enhanced Emotional Analytics Section */}
        <motion.div className="mt-10" variants={item}>
          <h2 className="text-2xl font-semibold text-pink-800 mb-4">Emotional Analytics</h2>
          <EnhancedEmotionalAnalytics emotionLogs={emotionLogs} isLoading={isLoading} error={error} />
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  )
}
