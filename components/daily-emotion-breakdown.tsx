"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { ChevronLeft, AlertCircle, BarChart3, PieChartIcon } from "lucide-react"
import type { EmotionEntry } from "@/utils/emotion-analytics"
import { safeFormatDate } from "@/utils/safe-date-utils"

interface DailyEmotionBreakdownProps {
  date: string
  entries: EmotionEntry[]
  onClose?: () => void
}

export function DailyEmotionBreakdown({ date, entries, onClose }: DailyEmotionBreakdownProps) {
  const [visualizationType, setVisualizationType] = useState<"pie" | "bar">("pie")

  const formattedDate = useMemo(() => {
    return safeFormatDate(date, { weekday: "long", month: "long", day: "numeric" }, date)
  }, [date])

  // Process data for charts
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return []

    // Group by emotion
    const emotionMap = new Map<string, { count: number; totalIntensity: number }>()

    entries.forEach((entry) => {
      if (!emotionMap.has(entry.emotion)) {
        emotionMap.set(entry.emotion, { count: 0, totalIntensity: 0 })
      }

      const data = emotionMap.get(entry.emotion)!
      data.count += 1
      data.totalIntensity += entry.intensity
    })

    // Convert to array for chart
    return Array.from(emotionMap.entries())
      .map(([emotion, data]) => ({
        name: emotion,
        value: data.count,
        intensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
        color: getEmotionColor(emotion),
      }))
      .sort((a, b) => b.value - a.value)
  }, [entries])

  // Get emotion color
  const getEmotionColor = (emotion: string) => {
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
  }

  // Calculate average intensity
  const avgIntensity = useMemo(() => {
    if (!entries || entries.length === 0) return 0
    const total = entries.reduce((sum, entry) => sum + entry.intensity, 0)
    return Math.round((total / entries.length) * 10) / 10
  }, [entries])

  return (
    <Card className="border-pink-200 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm text-pink-700 flex items-center gap-2">
              {formattedDate}
              <Badge variant="outline" className="text-xs border-pink-200">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-pink-600">Average intensity: {avgIntensity}/10</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${visualizationType === "pie" ? "bg-pink-100" : ""}`}
              onClick={() => setVisualizationType("pie")}
            >
              <PieChartIcon className="h-4 w-4 text-pink-600" />
              <span className="sr-only">Pie Chart</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${visualizationType === "bar" ? "bg-pink-100" : ""}`}
              onClick={() => setVisualizationType("bar")}
            >
              <BarChart3 className="h-4 w-4 text-pink-600" />
              <span className="sr-only">Bar Chart</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 text-pink-600" />
              <span className="sr-only">Back</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {entries.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center text-pink-600 bg-pink-50 rounded-md p-4">
            <AlertCircle className="h-8 w-8 text-pink-400 mb-2" />
            <p className="text-sm">No emotions recorded for this day.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart visualization */}
            <div className="h-[200px] bg-white">
              <ResponsiveContainer width="100%" height="100%">
                {visualizationType === "pie" ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [`${value} entries`, props.payload.name]}
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #f9a8d4",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    />
                  </PieChart>
                ) : (
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, "auto"]} />
                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Count") return [`${value} ${value === 1 ? "entry" : "entries"}`]
                        if (name === "Intensity") return [`${value}/10`, "Avg. Intensity"]
                        return [value, name]
                      }}
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #f9a8d4",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#db2777">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar dataKey="intensity" name="Intensity" fill="#be185d" opacity={0.6} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Entries list */}
            <div className="max-h-[200px] overflow-y-auto pr-1 pt-2 border-t border-pink-100">
              <h4 className="text-xs font-medium text-pink-700 mb-2">All entries for this day:</h4>
              <div className="space-y-2">
                {entries.map((entry, idx) => (
                  <div key={idx} className="text-xs p-2 bg-pink-50 rounded-md border border-pink-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{entry.emoji}</span>
                        <span className="font-medium text-pink-800">{entry.emotion}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Intensity: {entry.intensity}/10
                      </Badge>
                    </div>
                    {entry.notes && <p className="mt-1 text-pink-700 line-clamp-2">{entry.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
