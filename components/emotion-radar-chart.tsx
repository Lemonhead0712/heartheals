"use client"

import { useMemo } from "react"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PolarRadiusAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmotionEntry } from "@/utils/emotion-analytics"

interface EmotionRadarChartProps {
  entries: EmotionEntry[]
  title?: string
  description?: string
  className?: string
}

export function EmotionRadarChart({
  entries,
  title = "Emotion Balance",
  description = "Distribution of your emotions by intensity",
  className = "",
}: EmotionRadarChartProps) {
  // Define preset emotion categories that we want to track
  const emotionCategories = [
    "Joy",
    "Happy",
    "Excited",
    "Calm",
    "Peaceful",
    "Relaxed",
    "Sad",
    "Depressed",
    "Melancholy",
    "Angry",
    "Frustrated",
    "Irritated",
    "Anxious",
    "Worried",
    "Nervous",
    "Fear",
    "Scared",
    "Surprised",
  ]

  // Process data for radar chart with error handling
  const chartData = useMemo(() => {
    try {
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        // Return empty data structure with all emotion categories
        return emotionCategories.map((category) => ({
          emotion: category,
          intensity: 0,
          count: 0,
        }))
      }

      // Create a map to track intensity and count for each emotion category
      const emotionMap = new Map<string, { count: number; totalIntensity: number }>()

      // Initialize all emotion categories with zero values
      emotionCategories.forEach((category) => {
        emotionMap.set(category, { count: 0, totalIntensity: 0 })
      })

      // Process each entry
      entries.forEach((entry) => {
        if (!entry || typeof entry !== "object") return

        const emotion = entry.emotion || "Unknown"
        const intensity = typeof entry.intensity === "number" ? entry.intensity : 5 // Default to middle intensity

        // Check if the emotion exactly matches one of our categories
        if (emotionMap.has(emotion)) {
          const data = emotionMap.get(emotion)!
          data.count += 1
          data.totalIntensity += intensity
        } else {
          // Try to find a similar category
          const similarCategory = emotionCategories.find(
            (category) =>
              emotion.toLowerCase().includes(category.toLowerCase()) ||
              category.toLowerCase().includes(emotion.toLowerCase()),
          )

          if (similarCategory) {
            const data = emotionMap.get(similarCategory)!
            data.count += 1
            data.totalIntensity += intensity
          }
        }
      })

      // Convert map to array and calculate average intensity
      return Array.from(emotionMap.entries())
        .map(([emotion, data]) => ({
          emotion,
          intensity: data.count > 0 ? Math.round((data.totalIntensity / data.count) * 10) / 10 : 0,
          count: data.count,
        }))
        .filter((item) => emotionCategories.includes(item.emotion)) // Only include our predefined categories
    } catch (error) {
      console.error("Error processing radar chart data:", error)
      return []
    }
  }, [entries])

  // Generate colors for the radar areas based on emotion type
  const getRadarColor = (emotion: string) => {
    // Color mapping based on emotion categories
    if (["Joy", "Happy", "Excited"].includes(emotion)) {
      return { fill: "rgba(74, 222, 128, 0.2)", stroke: "rgba(74, 222, 128, 0.8)" } // Green for positive
    } else if (["Calm", "Peaceful", "Relaxed"].includes(emotion)) {
      return { fill: "rgba(96, 165, 250, 0.2)", stroke: "rgba(96, 165, 250, 0.8)" } // Blue for calm
    } else if (["Sad", "Depressed", "Melancholy"].includes(emotion)) {
      return { fill: "rgba(147, 51, 234, 0.2)", stroke: "rgba(147, 51, 234, 0.8)" } // Purple for sad
    } else if (["Angry", "Frustrated", "Irritated"].includes(emotion)) {
      return { fill: "rgba(248, 113, 113, 0.2)", stroke: "rgba(248, 113, 113, 0.8)" } // Red for angry
    } else if (["Anxious", "Worried", "Nervous"].includes(emotion)) {
      return { fill: "rgba(251, 191, 36, 0.2)", stroke: "rgba(251, 191, 36, 0.8)" } // Yellow for anxious
    } else {
      return { fill: "rgba(219, 39, 119, 0.2)", stroke: "rgba(219, 39, 119, 0.8)" } // Pink default
    }
  }

  // Group emotions into categories for a cleaner chart
  const groupedChartData = useMemo(() => {
    const groups = {
      Positive: ["Joy", "Happy", "Excited"],
      Calm: ["Calm", "Peaceful", "Relaxed"],
      Sad: ["Sad", "Depressed", "Melancholy"],
      Angry: ["Angry", "Frustrated", "Irritated"],
      Anxious: ["Anxious", "Worried", "Nervous"],
      Fear: ["Fear", "Scared", "Surprised"],
    }

    return Object.entries(groups).map(([groupName, emotions]) => {
      const relevantEmotions = chartData.filter((item) => emotions.includes(item.emotion))
      const totalIntensity = relevantEmotions.reduce((sum, item) => sum + item.intensity * item.count, 0)
      const totalCount = relevantEmotions.reduce((sum, item) => sum + item.count, 0)

      return {
        emotion: groupName,
        intensity: totalCount > 0 ? Math.round((totalIntensity / totalCount) * 10) / 10 : 0,
        count: totalCount,
      }
    })
  }, [chartData])

  // Custom tooltip formatter with error handling
  const tooltipFormatter = (value: number, name: string, props: any) => {
    try {
      if (name === "intensity") {
        return [`${value}/10`, "Avg. Intensity"]
      }
      return [value, name]
    } catch (error) {
      console.error("Error formatting tooltip:", error)
      return [value, name] // Return default format on error
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-pink-700">{title}</CardTitle>
        <CardDescription className="text-xs text-pink-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {groupedChartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="75%" data={groupedChartData}>
                <PolarGrid stroke="#f9a8d4" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 12, fill: "#9f1239" }} style={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} tickCount={6} stroke="#f9a8d4" />
                <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{
                    backgroundColor: "white",
                    borderColor: "#f9a8d4",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Radar
                  name="intensity"
                  dataKey="intensity"
                  fill="rgba(219, 39, 119, 0.15)"
                  stroke="rgba(219, 39, 119, 0.8)"
                  fillOpacity={0.6}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-sm text-pink-600">
            No emotion data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
