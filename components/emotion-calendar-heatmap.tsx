"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarDays, ChevronLeft, ChevronRight, Info, Layers } from "lucide-react"
import type { EmotionEntry } from "@/utils/emotion-analytics"

interface EmotionCalendarHeatmapProps {
  entries: EmotionEntry[]
  onSelectDate?: (date: string, entries: EmotionEntry[]) => void
  className?: string
}

export function EmotionCalendarHeatmap({ entries, onSelectDate, className = "" }: EmotionCalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, EmotionEntry[]> = {}

    entries.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }

      grouped[dateKey].push(entry)
    })

    return grouped
  }, [entries])

  // Get calendar days for current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    // Create array for all days to display
    const days = []

    try {
      // Add days from previous month
      const prevMonth = new Date(year, month, 0)
      const prevMonthLastDay = prevMonth.getDate()

      for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
        const date = new Date(year, month - 1, i)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

        days.push({
          date,
          dateKey,
          isCurrentMonth: false,
          entries: entriesByDate[dateKey] || [],
        })
      }

      // Add days from current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

        days.push({
          date,
          dateKey,
          isCurrentMonth: true,
          entries: entriesByDate[dateKey] || [],
        })
      }

      // Fill in days from next month to complete the grid
      const totalDaysToShow = Math.ceil(days.length / 7) * 7
      const daysToAdd = totalDaysToShow - days.length

      for (let i = 1; i <= daysToAdd; i++) {
        const date = new Date(year, month + 1, i)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

        days.push({
          date,
          dateKey,
          isCurrentMonth: false,
          entries: entriesByDate[dateKey] || [],
        })
      }
    } catch (error) {
      console.error("Error generating calendar days:", error)
      return [] // Return empty array on error
    }

    return days
  }, [currentMonth, entriesByDate])

  // Get dominant emotion for a day
  const getDominantEmotion = (dayEntries: EmotionEntry[]) => {
    if (!dayEntries || dayEntries.length === 0) return null

    const emotionCounts: Record<string, number> = {}

    dayEntries.forEach((entry) => {
      if (!emotionCounts[entry.emotion]) {
        emotionCounts[entry.emotion] = 0
      }
      emotionCounts[entry.emotion]++
    })

    let dominantEmotion = ""
    let maxCount = 0

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        dominantEmotion = emotion
        maxCount = count
      }
    })

    return dominantEmotion
  }

  // Get intensity level for a day (average of all entries)
  const getIntensityLevel = (dayEntries: EmotionEntry[]) => {
    if (!dayEntries || dayEntries.length === 0) return 0

    const totalIntensity = dayEntries.reduce((sum, entry) => sum + entry.intensity, 0)
    return Math.round((totalIntensity / dayEntries.length) * 10) / 10
  }

  // Get color for emotion with error handling
  const getEmotionColor = (emotion: string) => {
    try {
      if (!emotion) return "#cccccc" // Default gray for undefined emotions

      // Basic emotion colors
      const colors: Record<string, string> = {
        Joy: "#4CAF50",
        Happy: "#4CAF50",
        Sad: "#9C27B0",
        Sadness: "#9C27B0",
        Anger: "#F44336",
        Angry: "#F44336",
        Fear: "#795548",
        Anxious: "#FFC107",
        Anxiety: "#FFC107",
        Calm: "#2196F3",
        Surprise: "#607D8B",
        Trust: "#00BCD4",
        Anticipation: "#FF9800",
        Disgust: "#795548",
      }

      // Check for exact match or partial match
      const normalizedEmotion = emotion.toLowerCase()

      if (colors[emotion]) {
        return colors[emotion]
      }

      for (const [key, value] of Object.entries(colors)) {
        if (normalizedEmotion.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedEmotion)) {
          return value
        }
      }

      // Generate a color based on the emotion string
      const hash = Array.from(normalizedEmotion).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
      const h = Math.abs(hash) % 360
      return `hsl(${h}, 70%, 50%)`
    } catch (error) {
      console.error("Error getting emotion color:", error)
      return "#cccccc" // Default gray on error
    }
  }

  // Get a visual representation of intensity
  const getIntensityClass = (intensity: number) => {
    if (intensity === 0) return ""
    if (intensity < 3) return "opacity-30"
    if (intensity < 5) return "opacity-50"
    if (intensity < 7) return "opacity-70"
    return "opacity-90"
  }

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Go to current month
  const goToCurrentMonth = () => {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  // Handle day click with safety checks
  const handleDayClick = (day: any) => {
    try {
      if (day && day.entries && day.entries.length > 0 && onSelectDate && day.dateKey) {
        onSelectDate(day.dateKey, day.entries)
      }
    } catch (error) {
      console.error("Error handling day click:", error)
    }
  }

  // Week day headers
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-pink-600" />
          <h3 className="text-sm font-medium text-pink-700">
            {currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={prevMonth} title="Previous month">
            <ChevronLeft className="h-4 w-4 text-pink-600" />
            <span className="sr-only">Previous month</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-2 py-1 border-pink-200 text-pink-700"
            onClick={goToCurrentMonth}
          >
            Today
          </Button>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={nextMonth} title="Next month">
            <ChevronRight className="h-4 w-4 text-pink-600" />
            <span className="sr-only">Next month</span>
          </Button>

          <TooltipProvider>
            <TooltipComponent>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4 text-pink-500" />
                  <span className="sr-only">Calendar help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="p-3 max-w-xs bg-white border border-pink-100 text-xs text-pink-800">
                <p className="mb-2">
                  This calendar shows your recorded emotional states by day. Dates with entries are colored by the
                  dominant emotion.
                </p>
                <p>
                  Color saturation indicates intensity (darker = more intense). Click on a day with entries to see
                  details.
                </p>
              </TooltipContent>
            </TooltipComponent>
          </TooltipProvider>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-xs font-medium text-center p-1 text-pink-700">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, i) => {
          const dominantEmotion = getDominantEmotion(day.entries)
          const intensityLevel = getIntensityLevel(day.entries)
          const hasEntries = day.entries.length > 0
          const isToday = new Date().toDateString() === day.date.toDateString()

          return (
            <div
              key={i}
              onClick={() => handleDayClick(day)}
              className={`
                relative h-12 p-1 text-xs rounded-md border border-transparent transition-all duration-150
                ${hasEntries ? "cursor-pointer hover:border-pink-300 hover:shadow-sm" : ""}
                ${!day.isCurrentMonth ? "opacity-40" : ""}
                ${isToday ? "border-pink-300 shadow-sm" : ""}
              `}
            >
              <div className="absolute top-1 right-1 flex justify-end">
                <span
                  className={`
                    inline-block rounded-full text-[10px] leading-none w-5 h-5 flex items-center justify-center
                    ${isToday ? "bg-pink-600 text-white font-medium" : "text-pink-800"}
                  `}
                >
                  {day.date.getDate()}
                </span>
              </div>

              {hasEntries && (
                <div
                  className={`
                    absolute inset-0 rounded-md ${getIntensityClass(intensityLevel)}
                  `}
                  style={{
                    backgroundColor: dominantEmotion ? getEmotionColor(dominantEmotion) : "transparent",
                    opacity: 0.15 + intensityLevel / 20,
                  }}
                />
              )}

              {hasEntries && (
                <div className="absolute bottom-1 left-1">
                  <Badge
                    className="text-[8px] h-4 bg-white/90 text-pink-800 px-1"
                    title={`${day.entries.length} emotion ${day.entries.length === 1 ? "entry" : "entries"}`}
                  >
                    <Layers className="h-2 w-2 mr-0.5" />
                    {day.entries.length}
                  </Badge>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
