"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmotionCalendarHeatmap } from "./emotion-calendar-heatmap"
import { EmotionRadarChart } from "./emotion-radar-chart"
import { DailyEmotionBreakdown } from "./daily-emotion-breakdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Calendar, PieChart } from "lucide-react"
import type { EmotionEntry } from "@/utils/emotion-analytics"

interface InteractiveEmotionPatternsProps {
  entries: EmotionEntry[]
  className?: string
}

export function InteractiveEmotionPatterns({ entries, className = "" }: InteractiveEmotionPatternsProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<EmotionEntry[]>([])
  const [activeView, setActiveView] = useState<"calendar" | "radar" | "daily">("calendar")

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
        {selectedDate && activeView === "daily" ? (
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
              <EmotionCalendarHeatmap entries={entries} onSelectDate={handleDateSelect} />
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
