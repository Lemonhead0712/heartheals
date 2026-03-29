"use client"

import { useMemo } from "react"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts"
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
  // Process data for radar chart with error handling
  const chartData = useMemo(() => {
    try {
      if (!entries || !Array.isArray(entries) || entries.length === 0) return []

      // Group by emotion and calculate average intensity
      const emotionMap = new Map<string, { count: number; totalIntensity: number }>()

      entries.forEach((entry) => {
        if (!entry || typeof entry !== "object") return

        const emotion = entry.emotion || "Unknown"
        const intensity = typeof entry.intensity === "number" ? entry.intensity : 5 // Default to middle intensity

        if (!emotionMap.has(emotion)) {
          emotionMap.set(emotion, { count: 0, totalIntensity: 0 })
        }

        const data = emotionMap.get(emotion)!
        data.count += 1
        data.totalIntensity += intensity
      })

      // Take top emotions (up to 8) to avoid overcrowding the chart
      return Array.from(emotionMap.entries())
        .map(([emotion, data]) => ({
          emotion,
          intensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
    } catch (error) {
      console.error("Error processing radar chart data:", error)
      return []
    }
  }, [entries])

  // Generate colors for the radar areas
  const getRadarColor = () => {
    return {
      fill: "rgba(219, 39, 119, 0.15)",
      stroke: "rgba(219, 39, 119, 0.8)",
      fillOpacity: 0.6,
    }
  }

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
        {chartData.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#f9a8d4" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 11, fill: "#9f1239" }} style={{ fontSize: 11 }} />
                <Radar
                  name="intensity"
                  dataKey="intensity"
                  {...getRadarColor()}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{
                    backgroundColor: "white",
                    borderColor: "#f9a8d4",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-sm text-pink-600">
            No emotion data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
