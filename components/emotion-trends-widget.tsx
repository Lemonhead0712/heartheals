"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { processEmotionData, type EmotionEntry } from "@/utils/emotion-analytics"
import { LoadingSpinner } from "./ui/loading-spinner"
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react"

export function EmotionTrendsWidget() {
  const [isLoading, setIsLoading] = useState(true)
  const [emotionData, setEmotionData] = useState<EmotionEntry[]>([])
  const [recentEmotions, setRecentEmotions] = useState<EmotionEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load emotion data from localStorage
  useEffect(() => {
    const loadEmotionData = () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get data from localStorage
        const storedData = localStorage.getItem("heartsHeal_emotionLogs")

        if (storedData) {
          const parsedData = JSON.parse(storedData)

          // Convert string timestamps back to Date objects
          const processedData = parsedData.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))

          setEmotionData(processedData)

          // Get the 3 most recent entries
          const sortedEntries = [...processedData].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )

          setRecentEmotions(sortedEntries.slice(0, 3))
        } else {
          setEmotionData([])
          setRecentEmotions([])
        }
      } catch (err) {
        console.error("Error loading emotion data:", err)
        setError("Failed to load your emotion data.")
        setEmotionData([])
        setRecentEmotions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadEmotionData()

    // Set up event listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "heartsHeal_emotionLogs") {
        loadEmotionData()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Process the data for the chart
  const analytics = processEmotionData(emotionData)

  // Function to get trend icon
  const getTrendIcon = () => {
    switch (analytics.recentTrend) {
      case "improving":
        return <TrendingDown className="h-5 w-5 text-green-500" />
      case "worsening":
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case "stable":
        return <Minus className="h-5 w-5 text-blue-500" />
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />
    }
  }

  // Function to get trend badge color
  const getTrendBadgeColor = () => {
    switch (analytics.recentTrend) {
      case "improving":
        return "bg-green-100 text-green-800"
      case "worsening":
        return "bg-red-100 text-red-800"
      case "stable":
        return "bg-blue-100 text-blue-800"
      case "mixed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        ` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      )
    }
  }

  return (
    <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-pink-700">Emotional Trends</CardTitle>
        <CardDescription className="text-pink-600">Your recent emotional patterns and insights</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : emotionData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <p className="text-pink-700 mb-4">No emotion logs found. Start tracking your emotions to see trends.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trend Summary */}
            <div className="flex items-center justify-between bg-pink-50 p-3 rounded-md">
              <div className="flex items-center">
                {getTrendIcon()}
                <div className="ml-2">
                  <p className="text-sm font-medium text-pink-800">Emotional Trend</p>
                  <p className="text-xs text-pink-600">Based on your recent entries</p>
                </div>
              </div>
              <Badge className={getTrendBadgeColor()}>
                {analytics.recentTrend.charAt(0).toUpperCase() + analytics.recentTrend.slice(1).replace("-", " ")}
              </Badge>
            </div>

            {/* Recent Emotions */}
            <div>
              <h3 className="text-sm font-medium text-pink-700 mb-2">Recent Emotions</h3>
              <div className="space-y-2">
                {recentEmotions.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-white p-2 rounded-md border border-pink-100"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{entry.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-pink-800">{entry.emotion}</p>
                        <p className="text-xs text-pink-600">{formatDate(new Date(entry.timestamp))}</p>
                      </div>
                    </div>
                    <Badge className="bg-pink-100 text-pink-800">{entry.intensity}/10</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Intensity Chart */}
            {analytics.intensityOverTime.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-pink-700 mb-2">Intensity Over Time</h3>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.intensityOverTime}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value}/10`, "Intensity"]}
                        contentStyle={{ fontSize: "12px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="intensity"
                        stroke="#E91E63"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
