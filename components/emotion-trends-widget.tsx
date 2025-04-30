"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { processEmotionData, type EmotionEntry } from "@/utils/emotion-analytics"
import { LoadingSpinner } from "./ui/loading-spinner"
import { TrendingUp, TrendingDown, Minus, HelpCircle, RefreshCw, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatRelativeTime, getDateRangeForPeriod } from "@/utils/date-utils"
import { useRealTimeUpdate } from "@/hooks/use-real-time-update"

export function EmotionTrendsWidget() {
  const [isLoading, setIsLoading] = useState(true)
  const [emotionData, setEmotionData] = useState<EmotionEntry[]>([])
  const [recentEmotions, setRecentEmotions] = useState<EmotionEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week")

  // Update the component every minute to keep relative times current
  const currentTime = useRealTimeUpdate(60000)

  // Load emotion data from localStorage
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

        // Filter data based on selected time range
        const { start } = getDateRangeForPeriod(timeRange)
        const filteredData = processedData.filter((entry: EmotionEntry) => new Date(entry.timestamp) >= start)

        setEmotionData(filteredData)

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
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    loadEmotionData()
  }

  // Handle time range change
  const handleTimeRangeChange = (range: "day" | "week" | "month") => {
    setTimeRange(range)
  }

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

  // Get date range text
  const getDateRangeText = () => {
    const { start, end } = getDateRangeForPeriod(timeRange)

    switch (timeRange) {
      case "day":
        return "Today"
      case "week":
        return "Past 7 days"
      case "month":
        return "Past 30 days"
      default:
        return "Custom range"
    }
  }

  return (
    <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-pink-700">Emotional Trends</CardTitle>
          <CardDescription className="text-pink-600">Your recent emotional patterns and insights</CardDescription>
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
            {/* Time range selector */}
            <div className="flex items-center justify-between bg-pink-50 p-3 rounded-md">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-pink-600 mr-2" />
                <span className="text-sm font-medium text-pink-700">{getDateRangeText()}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={timeRange === "day" ? "default" : "outline"}
                  onClick={() => handleTimeRangeChange("day")}
                  className={timeRange === "day" ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200 text-pink-700"}
                >
                  Day
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "week" ? "default" : "outline"}
                  onClick={() => handleTimeRangeChange("week")}
                  className={timeRange === "week" ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200 text-pink-700"}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "month" ? "default" : "outline"}
                  onClick={() => handleTimeRangeChange("month")}
                  className={timeRange === "month" ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200 text-pink-700"}
                >
                  Month
                </Button>
              </div>
            </div>

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
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-pink-700">Recent Emotions</h3>
                <span className="text-xs text-pink-500">Last updated: {formatRelativeTime(new Date())}</span>
              </div>
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
                        <p className="text-xs text-pink-600">{formatRelativeTime(new Date(entry.timestamp))}</p>
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
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-pink-700">Intensity Over Time</h3>
                  <span className="text-xs text-pink-500">Real-time data</span>
                </div>
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
