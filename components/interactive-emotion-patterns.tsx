"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmotionCalendarHeatmap } from "./emotion-calendar-heatmap"
import { EmotionRadarChart } from "./emotion-radar-chart"
import { DailyEmotionBreakdown } from "./daily-emotion-breakdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Calendar, PieChart, AlertCircle } from "lucide-react"
import type { EmotionEntry } from "@/utils/emotion-analytics"

interface InteractiveEmotionPatternsProps {
  entries: EmotionEntry[]
  className?: string
}

export function InteractiveEmotionPatterns({ entries, className = "" }: InteractiveEmotionPatternsProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<EmotionEntry[]>([])
  const [activeView, setActiveView] = useState<"calendar" | "radar" | "daily">("calendar")
  const [error, setError] = useState<string | null>(null)

  // Handle date selection from calendar
  const handleDateSelect = (date: string, entries: EmotionEntry[]) => {
    setSelectedDate(date)
    setSelectedEntries(entries)
    setActiveView("daily")
  }

  // Close daily view and go back
  const handleCloseDailyView = () => {
    setSelectedDate(null)
    setSelectedEntries([])
    setActiveView("calendar")
  }

  useEffect(() => {
    try {
      // Validate entries
      if (!Array.isArray(entries)) {
        throw new Error("Entries must be an array")
      }

      // Reset error if entries are valid
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error in InteractiveEmotionPatterns:", err)
    }
  }, [entries])

  return (
    <Card className={`border-pink-200 bg-white/80 backdrop-blur-sm shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-pink-700 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Emotional Patterns
        </CardTitle>
        <CardDescription className="text-pink-600">Interactive visualization of your emotional journey</CardDescription>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            <div>
              <p className="font-medium">Error loading emotional patterns</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : selectedDate && activeView === "daily" ? (
          <DailyEmotionBreakdown date={selectedDate} entries={selectedEntries} onClose={handleCloseDailyView} />
        ) : (
          <Tabs defaultValue="calendar" value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="radar" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800">
                <PieChart className="h-4 w-4 mr-2" />
                Emotion Balance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-0">
              {entries.length > 0 ? (
                <EmotionCalendarHeatmap entries={entries} onSelectDate={handleDateSelect} />
              ) : (
                <div className="p-8 text-center text-pink-600 bg-pink-50 rounded-md">
                  <p>No emotion data available for the selected period.</p>
                  <p className="text-sm mt-2">Try selecting a different time range or add new emotion entries.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="radar" className="mt-0">
              <EmotionRadarChart entries={entries} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
